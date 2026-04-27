import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '../_auth';
import { db } from '../_db';
import { handleApiError, methodNotAllowed, notFound, parseBody, readId, setApiHeaders } from '../_http';
import { updateTagSchema, uuidSchema } from '../_schemas';
import { serializeTag } from '../_serializers';
import { tags } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    const id = uuidSchema.parse(readId(req));

    if (req.method === 'GET') {
      const tag = await db.query.tags.findFirst({
        where: and(eq(tags.id, id), eq(tags.userId, session.id))
      });
      if (!tag) return notFound(res, '标签不存在或无权访问');
      res.status(200).json({ tag: serializeTag(tag) });
      return;
    }

    if (req.method === 'PATCH') {
      const input = parseBody(updateTagSchema, req);
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.color !== undefined) updateData.color = input.color;
      const [updated] = await db
        .update(tags)
        .set(updateData)
        .where(and(eq(tags.id, id), eq(tags.userId, session.id)))
        .returning();
      if (!updated) return notFound(res, '标签不存在或无权访问');
      res.status(200).json({ tag: serializeTag(updated) });
      return;
    }

    if (req.method === 'DELETE') {
      const [deleted] = await db
        .delete(tags)
        .where(and(eq(tags.id, id), eq(tags.userId, session.id)))
        .returning();
      if (!deleted) return notFound(res, '标签不存在或无权访问');
      res.status(200).json({ tag: serializeTag(deleted) });
      return;
    }

    methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  } catch (error) {
    handleApiError(res, error);
  }
}
