import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { requireSession } from './_auth.js';
import { db } from './_db.js';
import { handleApiError, methodNotAllowed, parseBody, setApiHeaders } from './_http.js';
import { updateMeSchema } from './_schemas.js';
import { serializeUser } from './_serializers.js';
import { users } from '../drizzle/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  const session = await requireSession(req, res);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.id)
      });
      if (!user) {
        res.status(401).json({ message: '登录状态已失效，请重新登录' });
        return;
      }
      res.status(200).json({ user: serializeUser(user) });
      return;
    }

    if (req.method === 'PATCH') {
      const input = parseBody(updateMeSchema, req);
      const updateData: Record<string, unknown> = {};
      if (input.nickname !== undefined) updateData.nickname = input.nickname;
      if (input.avatar !== undefined) updateData.avatar = input.avatar;
      if (input.theme !== undefined) updateData.theme = input.theme;

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, session.id))
        .returning({
          id: users.id,
          account: users.account,
          nickname: users.nickname,
          avatar: users.avatar,
          theme: users.theme,
          createdAt: users.createdAt
        });

      res.status(200).json({ user: serializeUser(updated) });
      return;
    }

    methodNotAllowed(res, ['GET', 'PATCH']);
  } catch (error) {
    handleApiError(res, error);
  }
}
