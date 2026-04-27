import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError, type ZodSchema } from 'zod';

export function setApiHeaders(res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ message: 'Method not allowed' });
}

export function parseBody<T>(schema: ZodSchema<T>, req: VercelRequest): T {
  return schema.parse(req.body ?? {});
}

export function readId(req: VercelRequest, key = 'id') {
  const value = req.query[key];
  return Array.isArray(value) ? value[0] : value;
}

export function readStringQuery(req: VercelRequest, key: string) {
  const value = req.query[key];
  return Array.isArray(value) ? value[0] : value;
}

export function handleApiError(res: VercelResponse, error: unknown) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: '请求参数不正确',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: '服务器开小差了，请稍后再试' });
}

export function notFound(res: VercelResponse, message = '数据不存在或无权访问') {
  res.status(404).json({ message });
}
