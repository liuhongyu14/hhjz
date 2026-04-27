import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '../_auth';
import { db } from '../_db';
import { handleApiError, methodNotAllowed, notFound, parseBody, readId, setApiHeaders } from '../_http';
import { updateTransactionSchema, uuidSchema } from '../_schemas';
import { serializeTransaction } from '../_serializers';
import { ensureOwnedCategory, ensureOwnedTags } from '../_ownership';
import { transactionTags, transactions } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    const id = uuidSchema.parse(readId(req));

    const current = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, session.id))
    });

    if (!current) {
      notFound(res, '账单不存在或无权访问');
      return;
    }

    if (req.method === 'GET') {
      const links = await db.query.transactionTags.findMany({
        where: eq(transactionTags.transactionId, current.id)
      });
      res.status(200).json({ transaction: serializeTransaction(current, links) });
      return;
    }

    if (req.method === 'PATCH') {
      const input = parseBody(updateTransactionSchema, req);

      if (input.categoryId && !(await ensureOwnedCategory(session.id, input.categoryId))) {
        res.status(400).json({ message: '分类不存在或无权使用' });
        return;
      }

      if (input.tagIds) {
        const ownedTags = await ensureOwnedTags(session.id, input.tagIds);
        if (!ownedTags) {
          res.status(400).json({ message: '标签不存在或无权使用' });
          return;
        }
      }

      const { tagIds, amount, occurredAt, categoryId, ...rest } = input;
      const updateData: Record<string, unknown> = {
        ...rest
      };
      if (amount !== undefined) updateData.amount = amount.toFixed(2);
      if (occurredAt !== undefined) updateData.occurredAt = new Date(occurredAt);
      if (categoryId !== undefined) updateData.categoryId = categoryId ?? null;

      const [updated] = await db
        .update(transactions)
        .set(updateData)
        .where(and(eq(transactions.id, id), eq(transactions.userId, session.id)))
        .returning();

      if (tagIds) {
        await db.delete(transactionTags).where(eq(transactionTags.transactionId, id));
        const uniqueTagIds = Array.from(new Set(tagIds));
        if (uniqueTagIds.length) {
          await db.insert(transactionTags).values(
            uniqueTagIds.map((tagId) => ({
              transactionId: id,
              tagId
            }))
          );
        }
      }

      const links = await db.query.transactionTags.findMany({
        where: eq(transactionTags.transactionId, id)
      });
      res.status(200).json({ transaction: serializeTransaction(updated, links) });
      return;
    }

    if (req.method === 'DELETE') {
      await db.delete(transactionTags).where(eq(transactionTags.transactionId, id));
      const [deleted] = await db
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, session.id)))
        .returning();
      res.status(200).json({ transaction: serializeTransaction(deleted) });
      return;
    }

    methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  } catch (error) {
    handleApiError(res, error);
  }
}
