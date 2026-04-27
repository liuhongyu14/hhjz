import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '../_auth.js';
import { db } from '../_db.js';
import { handleApiError, methodNotAllowed, notFound, parseBody, readId, setApiHeaders } from '../_http.js';
import { updateCategorySchema, uuidSchema } from '../_schemas.js';
import { serializeCategory } from '../_serializers.js';
import { categories } from '../../drizzle/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    const id = uuidSchema.parse(readId(req));

    if (req.method === 'GET') {
      const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, id), eq(categories.userId, session.id))
      });
      if (!category) return notFound(res, '分类不存在或无权访问');
      res.status(200).json({ category: serializeCategory(category) });
      return;
    }

    if (req.method === 'PATCH') {
      const input = parseBody(updateCategorySchema, req);
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
      const [updated] = await db
        .update(categories)
        .set(updateData)
        .where(and(eq(categories.id, id), eq(categories.userId, session.id)))
        .returning();
      if (!updated) return notFound(res, '分类不存在或无权访问');
      res.status(200).json({ category: serializeCategory(updated) });
      return;
    }

    if (req.method === 'DELETE') {
      const [deleted] = await db
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, session.id)))
        .returning();
      if (!deleted) return notFound(res, '分类不存在或无权访问');
      res.status(200).json({ category: serializeCategory(deleted) });
      return;
    }

    methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  } catch (error) {
    handleApiError(res, error);
  }
}
