import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie } from '../_auth';
import { methodNotAllowed, setApiHeaders } from '../_http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiHeaders(res);
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  clearSessionCookie(res);
  res.status(200).json({ message: '已退出登录' });
}
