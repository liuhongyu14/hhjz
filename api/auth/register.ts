import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../_db.js';
import { setSessionCookie, signSession } from '../_auth.js';
import { handleApiError, methodNotAllowed, parseBody, setApiHeaders } from '../_http.js';
import { authSchema } from '../_schemas.js';
import { serializeUser } from '../_serializers.js';
import { categories, tags, users } from '../../drizzle/schema.js';
import { defaultCategoryRows, defaultTagRows } from '../_defaults.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const input = parseBody(authSchema, req);

    const existed = await db.query.users.findFirst({
      where: eq(users.account, input.account)
    });

    if (existed) {
      res.status(409).json({ message: '账号已存在，请直接登录' });
      return;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const newUser = {
      account: input.account,
      nickname: input.account,
      passwordHash
    } as any;
    const [created] = await db
      .insert(users)
      .values(newUser)
      .returning({
        id: users.id,
        account: users.account,
        nickname: users.nickname,
        avatar: users.avatar,
        theme: users.theme,
        createdAt: users.createdAt
      });
    await db.insert(categories).values(
      defaultCategoryRows.map((category) => ({
        ...category,
        userId: created.id
      })) as any
    );
    await db.insert(tags).values(
      defaultTagRows.map((tag) => ({
        ...tag,
        userId: created.id
      })) as any
    );

    const token = await signSession({ id: created.id, account: created.account });
    setSessionCookie(res, token);
    res.status(201).json({ user: serializeUser(created), token });
  } catch (error) {
    handleApiError(res, error);
  }
}
