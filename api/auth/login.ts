import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../_db.js';
import { setSessionCookie, signSession } from '../_auth.js';
import { handleApiError, methodNotAllowed, parseBody, setApiHeaders } from '../_http.js';
import { authSchema } from '../_schemas.js';
import { serializeUser } from '../_serializers.js';
import { users } from '../../drizzle/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const input = parseBody(authSchema, req);

    const user = await db.query.users.findFirst({
      where: eq(users.account, input.account)
    });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      res.status(401).json({ message: '账号或密码不正确' });
      return;
    }

    const token = await signSession({ id: user.id, account: user.account });
    setSessionCookie(res, token);
    res.status(200).json({ user: serializeUser(user), token });
  } catch (error) {
    handleApiError(res, error);
  }
}
