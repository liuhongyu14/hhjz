import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, eq } from 'drizzle-orm';
import { requireSession } from '../_auth';
import { db } from '../_db';
import { handleApiError, methodNotAllowed, parseBody, setApiHeaders } from '../_http';
import { categorySchema } from '../_schemas';
import { serializeCategory } from '../_serializers';
import { categories } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const list = await db.query.categories.findMany({
        where: eq(categories.userId, session.id),
        orderBy: [asc(categories.sortOrder), asc(categories.createdAt)]
      });
      res.status(200).json({ list: list.map(serializeCategory) });
      return;
    }

    if (req.method === 'POST') {
      const input = parseBody(categorySchema, req);
      const newCategory = {
        name: input.name,
        icon: input.icon,
        color: input.color,
        description: input.description,
        type: input.type,
        sortOrder: input.sortOrder ?? 0,
        userId: session.id
      } as any;
      const [created] = await db
        .insert(categories)
        .values(newCategory)
        .returning();
      res.status(201).json({ category: serializeCategory(created) });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    handleApiError(res, error);
  }
}
