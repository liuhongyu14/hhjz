import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, asc, eq, ilike } from 'drizzle-orm';
import { requireSession } from '../_auth';
import { db } from '../_db';
import { handleApiError, methodNotAllowed, parseBody, readStringQuery, setApiHeaders } from '../_http';
import { tagSchema } from '../_schemas';
import { serializeTag } from '../_serializers';
import { tags } from '../../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const keyword = readStringQuery(req, 'keyword')?.trim();
      const list = await db.query.tags.findMany({
        where: keyword ? and(eq(tags.userId, session.id), ilike(tags.name, `%${keyword}%`)) : eq(tags.userId, session.id),
        orderBy: [asc(tags.createdAt)]
      });
      res.status(200).json({ list: list.map(serializeTag) });
      return;
    }

    if (req.method === 'POST') {
      const input = parseBody(tagSchema, req);
      const newTag = {
        name: input.name,
        color: input.color,
        userId: session.id
      } as any;
      const [created] = await db
        .insert(tags)
        .values(newTag)
        .returning();
      res.status(201).json({ tag: serializeTag(created) });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    handleApiError(res, error);
  }
}
