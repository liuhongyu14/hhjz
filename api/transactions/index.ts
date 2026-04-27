import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { requireSession } from '../_auth';
import { db } from '../_db';
import { handleApiError, methodNotAllowed, parseBody, readStringQuery, setApiHeaders } from '../_http';
import { transactionSchema } from '../_schemas';
import { serializeTransaction } from '../_serializers';
import { ensureOwnedCategory, ensureOwnedTags } from '../_ownership';
import { transactionTags, transactions } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const month = readStringQuery(req, 'month') ?? '';
      const conditions = [eq(transactions.userId, session.id)];

      if (/^\d{4}-\d{2}$/.test(month)) {
        const start = new Date(`${month}-01T00:00:00.000Z`);
        const end = new Date(start);
        end.setUTCMonth(end.getUTCMonth() + 1);
        conditions.push(gte(transactions.occurredAt, start), lt(transactions.occurredAt, end));
      }

      const list = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: (table, { desc }) => [desc(table.occurredAt)]
      });
      const ids = list.map((item) => item.id);
      const links = ids.length
        ? await db.query.transactionTags.findMany({
            where: inArray(transactionTags.transactionId, ids)
          })
        : [];

      res.status(200).json({ list: list.map((item) => serializeTransaction(item, links)) });
      return;
    }

    if (req.method === 'POST') {
      const input = parseBody(transactionSchema, req);
      const tagIds = input.tagIds ?? [];

      if (input.categoryId && !(await ensureOwnedCategory(session.id, input.categoryId))) {
        res.status(400).json({ message: '分类不存在或无权使用' });
        return;
      }

      const ownedTags = await ensureOwnedTags(session.id, tagIds);
      if (!ownedTags) {
        res.status(400).json({ message: '标签不存在或无权使用' });
        return;
      }

      const newTransaction = {
        userId: session.id,
        type: input.type,
        amount: input.amount.toFixed(2),
        categoryId: input.categoryId ?? null,
        paymentMethod: input.paymentMethod,
        note: input.note,
        occurredAt: new Date(input.occurredAt)
      } as any;

      const [created] = await db
        .insert(transactions)
        .values(newTransaction)
        .returning();

      if (tagIds.length) {
        await db.insert(transactionTags).values(
          Array.from(new Set(tagIds)).map((tagId) => ({
            transactionId: created.id,
            tagId
          }))
        );
      }

      const links = tagIds.length
        ? await db.query.transactionTags.findMany({
            where: eq(transactionTags.transactionId, created.id)
          })
        : [];
      res.status(201).json({ transaction: serializeTransaction(created, links) });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    handleApiError(res, error);
  }
}
