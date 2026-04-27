import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { JWTPayload } from 'jose';
import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');

export interface SessionUser {
  id: string;
  account: string;
}

export async function signSession(user: SessionUser) {
  const claims: JWTPayload & SessionUser = { ...user };
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

function sessionCookieAttributes(maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader('Set-Cookie', `haohao_session=${token}; ${sessionCookieAttributes(2592000)}`);
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', `haohao_session=; ${sessionCookieAttributes(0)}`);
}

export async function readSession(req: VercelRequest): Promise<SessionUser | null> {
  const authorization = req.headers.authorization;
  const bearer = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  const cookie = req.cookies?.haohao_session;
  const token = bearer || cookie;
  if (!token) return null;

  try {
    const result = await jwtVerify(token, secret);
    const payload = result.payload as unknown as SessionUser;
    return payload.id && payload.account ? payload : null;
  } catch {
    return null;
  }
}

export async function requireSession(req: VercelRequest, res: VercelResponse) {
  const session = await readSession(req);
  if (!session) {
    res.status(401).json({ message: '登录后继续' });
    return null;
  }
  return session;
}
