import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readSession, signSession } from '../api/_auth.js';

type MaybePromise<T> = T | Promise<T>;
type ThemeName = 'light' | 'dark' | 'warm';
type TransactionType = 'expense' | 'income';

interface DevRequest {
  method?: string;
  query: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
}

interface DevResponse {
  setHeader(name: string, value: number | string | readonly string[]): DevResponse;
  status(code: number): DevResponse;
  json(payload: unknown): void;
}

interface DevUser {
  id: string;
  account: string;
  passwordHash: string;
  nickname: string;
  avatar: string;
  theme: ThemeName;
  createdAt: string;
}

interface DevCategory {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
  type: TransactionType | 'both';
  createdAt: string;
}

interface DevTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

interface DevTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  paymentMethod: string;
  note: string;
  occurredAt: string;
  createdAt: string;
  tagIds: string[];
}

interface DevDb {
  users: DevUser[];
  categories: DevCategory[];
  tags: DevTag[];
  transactions: DevTransaction[];
}

const dbFile = path.resolve(process.cwd(), '.data/haohao-dev-db.json');

const defaultCategoryRows = [
  { name: '餐饮', icon: '🍜', color: '#ff7a1a', description: '早餐、午餐、咖啡与外卖', sortOrder: 1, type: 'expense' as const },
  { name: '交通', icon: '🚇', color: '#2878ff', description: '地铁、公交、打车与通勤', sortOrder: 2, type: 'expense' as const },
  { name: '购物', icon: '🛒', color: '#ff9f0a', description: '生活用品、网购与超市', sortOrder: 3, type: 'expense' as const },
  { name: '娱乐', icon: '🎬', color: '#8a5cf6', description: '电影、游戏、演出与会员', sortOrder: 4, type: 'expense' as const },
  { name: '学习', icon: '📚', color: '#20c777', description: '课程、书籍与资料', sortOrder: 5, type: 'expense' as const },
  { name: '医疗', icon: '💊', color: '#22c55e', description: '看诊、药品与体检', sortOrder: 6, type: 'expense' as const },
  { name: '居住', icon: '🏠', color: '#f97316', description: '房租、物业与家庭支出', sortOrder: 7, type: 'expense' as const },
  { name: '工资', icon: '💼', color: '#20c777', description: '固定薪资收入', sortOrder: 8, type: 'income' as const },
  { name: '奖金', icon: '🎁', color: '#f43f7b', description: '奖金、补贴与红包', sortOrder: 9, type: 'income' as const }
];

const defaultTagRows = [
  { name: '通勤', color: '#2878ff' },
  { name: '咖啡', color: '#ef3b16' },
  { name: '外卖', color: '#ffb400' },
  { name: '学习', color: '#20c777' },
  { name: '旅行', color: '#8a5cf6' },
  { name: '礼物', color: '#f43f7b' },
  { name: '宠物', color: '#2f9cf5' },
  { name: '家庭', color: '#ff7a1a' },
  { name: '报销', color: '#21c6c0' },
  { name: '约会', color: '#f43f7b' },
  { name: '运动', color: '#2f9cf5' },
  { name: '娱乐', color: '#8a5cf6' },
  { name: '购物', color: '#ff9f0a' },
  { name: '医疗', color: '#20c777' },
  { name: '房租', color: '#64748b' },
  { name: '零食', color: '#fb7185' },
  { name: '朋友', color: '#14b8a6' },
  { name: '更多', color: '#94a3b8' }
];

const emptyDb: DevDb = {
  users: [],
  categories: [],
  tags: [],
  transactions: []
};

function uid(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function cloneEmptyDb(): DevDb {
  return {
    users: [],
    categories: [],
    tags: [],
    transactions: []
  };
}

function methodNotAllowed(res: DevResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ message: 'Method not allowed' });
}

async function readDb(): Promise<DevDb> {
  try {
    const raw = await readFile(dbFile, 'utf8');
    return JSON.parse(raw) as DevDb;
  } catch {
    await mkdir(path.dirname(dbFile), { recursive: true });
    await writeFile(dbFile, JSON.stringify(emptyDb, null, 2), 'utf8');
    return cloneEmptyDb();
  }
}

async function writeDb(data: DevDb) {
  await mkdir(path.dirname(dbFile), { recursive: true });
  await writeFile(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

async function updateDb<T>(updater: (db: DevDb) => MaybePromise<T>): Promise<T> {
  const data = await readDb();
  const result = await updater(data);
  await writeDb(data);
  return result;
}

function serializeUser(user: DevUser) {
  return {
    id: user.id,
    account: user.account,
    nickname: user.nickname,
    avatar: user.avatar,
    theme: user.theme,
    createdAt: user.createdAt
  };
}

function unauthorized(res: DevResponse) {
  res.status(401).json({ message: '登录后继续' });
}

async function resolveSessionUser(req: DevRequest) {
  const session = await readSession(req as any);
  if (!session) return null;
  const db = await readDb();
  return db.users.find((user) => user.id === session.id) ?? null;
}

async function withAuth(req: DevRequest, res: DevResponse, handler: (user: DevUser, db: DevDb) => MaybePromise<void>) {
  const session = await readSession(req as any);
  if (!session) {
    unauthorized(res);
    return;
  }

  const db = await readDb();
  const user = db.users.find((item) => item.id === session.id);
  if (!user) {
    unauthorized(res);
    return;
  }

  await handler(user, db);
  await writeDb(db);
}

function filterByMonth(transactions: DevTransaction[], month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return transactions;
  return transactions.filter((item) => item.occurredAt.slice(0, 7) === month);
}

function ensureOwnedCategory(db: DevDb, userId: string, categoryId?: string | null) {
  if (!categoryId) return true;
  return db.categories.some((item) => item.userId === userId && item.id === categoryId);
}

function ensureOwnedTags(db: DevDb, userId: string, tagIds: string[]) {
  if (!tagIds.length) return true;
  const ownedIds = new Set(db.tags.filter((item) => item.userId === userId).map((item) => item.id));
  return tagIds.every((id) => ownedIds.has(id));
}

async function handleRegister(req: DevRequest, res: DevResponse) {
  const account = String(req.body?.account ?? '').trim();
  const password = String(req.body?.password ?? '');
  if (!account || password.length < 6) {
    res.status(400).json({ message: '请填写账号，并设置至少 6 位密码' });
    return;
  }

  await updateDb(async (db) => {
    if (db.users.some((item) => item.account === account)) {
      res.status(409).json({ message: '账号已存在，请直接登录' });
      return;
    }

    const user: DevUser = {
      id: uid('user'),
      account,
      passwordHash: await bcrypt.hash(password, 10),
      nickname: account,
      avatar: '👩🏻',
      theme: 'light',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    db.categories.push(
      ...defaultCategoryRows.map((item) => ({
        id: uid('category'),
        userId: user.id,
        createdAt: new Date().toISOString(),
        ...item
      }))
    );
    db.tags.push(
      ...defaultTagRows.map((item) => ({
        id: uid('tag'),
        userId: user.id,
        createdAt: new Date().toISOString(),
        ...item
      }))
    );

    const token = await signSession({ id: user.id, account: user.account });
    res.setHeader('Set-Cookie', `haohao_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    res.status(201).json({ user: serializeUser(user), token });
  });
}

async function handleLogin(req: DevRequest, res: DevResponse) {
  const account = String(req.body?.account ?? '').trim();
  const password = String(req.body?.password ?? '');
  if (!account || password.length < 6) {
    res.status(400).json({ message: '请输入账号和至少 6 位密码' });
    return;
  }

  const db = await readDb();
  const user = db.users.find((item) => item.account === account);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: '账号或密码不正确' });
    return;
  }

  const token = await signSession({ id: user.id, account: user.account });
  res.setHeader('Set-Cookie', `haohao_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  res.status(200).json({ user: serializeUser(user), token });
}

async function handleLogout(_req: DevRequest, res: DevResponse) {
  res.setHeader('Set-Cookie', 'haohao_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.status(200).json({ message: '已退出登录' });
}

export async function handleDevApi(req: DevRequest, res: DevResponse, pathname: string) {
  if (pathname === '/api/auth/register' && req.method === 'POST') return handleRegister(req, res);
  if (pathname === '/api/auth/login' && req.method === 'POST') return handleLogin(req, res);
  if (pathname === '/api/auth/logout' && req.method === 'POST') return handleLogout(req, res);

  if (pathname === '/api/me') {
    if (req.method === 'GET') {
      const user = await resolveSessionUser(req);
      if (!user) return unauthorized(res);
      res.status(200).json({ user: serializeUser(user) });
      return;
    }

    if (req.method === 'PATCH') {
      await withAuth(req, res, async (user, db) => {
        const current = db.users.find((item) => item.id === user.id)!;
        current.nickname = String(req.body?.nickname ?? current.nickname);
        current.avatar = String(req.body?.avatar ?? current.avatar);
        current.theme = (req.body?.theme ?? current.theme) as ThemeName;
        res.status(200).json({ user: serializeUser(current) });
      });
      return;
    }

    methodNotAllowed(res, ['GET', 'PATCH']);
    return;
  }

  if (pathname === '/api/categories') {
    if (req.method === 'GET') {
      await withAuth(req, res, async (user, db) => {
        const list = db.categories
          .filter((item) => item.userId === user.id)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
        res.status(200).json({ list });
      });
      return;
    }

    if (req.method === 'POST') {
      await withAuth(req, res, async (user, db) => {
        const category: DevCategory = {
          id: uid('category'),
          userId: user.id,
          name: String(req.body?.name ?? '').trim(),
          icon: String(req.body?.icon ?? '🗂'),
          color: String(req.body?.color ?? '#2878ff'),
          description: String(req.body?.description ?? ''),
          sortOrder: Number(req.body?.sortOrder ?? db.categories.filter((item) => item.userId === user.id).length + 1),
          type: (req.body?.type ?? 'expense') as DevCategory['type'],
          createdAt: new Date().toISOString()
        };
        db.categories.push(category);
        res.status(201).json({ category });
      });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
    return;
  }

  if (pathname.startsWith('/api/categories/')) {
    if (!['GET', 'PATCH', 'DELETE'].includes(req.method ?? '')) {
      methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
      return;
    }

    await withAuth(req, res, async (user, db) => {
      const id = pathname.split('/').pop()!;
      const category = db.categories.find((item) => item.userId === user.id && item.id === id);
      if (!category) {
        res.status(404).json({ message: '分类不存在或无权访问' });
        return;
      }

      if (req.method === 'GET') {
        res.status(200).json({ category });
        return;
      }

      if (req.method === 'PATCH') {
        Object.assign(category, req.body ?? {});
        res.status(200).json({ category });
        return;
      }

      if (req.method === 'DELETE') {
        db.categories = db.categories.filter((item) => item.id !== id);
        db.transactions = db.transactions.map((item) => (item.categoryId === id ? { ...item, categoryId: null } : item));
        res.status(200).json({ category });
        return;
      }
    });
    return;
  }

  if (pathname === '/api/tags') {
    if (req.method === 'GET') {
      await withAuth(req, res, async (user, db) => {
        const keyword = String(req.query.keyword ?? '').trim().toLowerCase();
        const list = db.tags
          .filter((item) => item.userId === user.id)
          .filter((item) => !keyword || item.name.toLowerCase().includes(keyword))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        res.status(200).json({ list });
      });
      return;
    }

    if (req.method === 'POST') {
      await withAuth(req, res, async (user, db) => {
        const tag: DevTag = {
          id: uid('tag'),
          userId: user.id,
          name: String(req.body?.name ?? '').trim(),
          color: String(req.body?.color ?? '#2878ff'),
          createdAt: new Date().toISOString()
        };
        db.tags.push(tag);
        res.status(201).json({ tag });
      });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
    return;
  }

  if (pathname.startsWith('/api/tags/')) {
    if (!['GET', 'PATCH', 'DELETE'].includes(req.method ?? '')) {
      methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
      return;
    }

    await withAuth(req, res, async (user, db) => {
      const id = pathname.split('/').pop()!;
      const tag = db.tags.find((item) => item.userId === user.id && item.id === id);
      if (!tag) {
        res.status(404).json({ message: '标签不存在或无权访问' });
        return;
      }

      if (req.method === 'GET') {
        res.status(200).json({ tag });
        return;
      }

      if (req.method === 'PATCH') {
        Object.assign(tag, req.body ?? {});
        res.status(200).json({ tag });
        return;
      }

      if (req.method === 'DELETE') {
        db.tags = db.tags.filter((item) => item.id !== id);
        db.transactions = db.transactions.map((item) => ({
          ...item,
          tagIds: item.tagIds.filter((tagId) => tagId !== id)
        }));
        res.status(200).json({ tag });
        return;
      }
    });
    return;
  }

  if (pathname === '/api/transactions') {
    if (req.method === 'GET') {
      await withAuth(req, res, async (user, db) => {
        const list = filterByMonth(
          db.transactions.filter((item) => item.userId === user.id).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
          req.query.month
        );
        res.status(200).json({ list });
      });
      return;
    }

    if (req.method === 'POST') {
      await withAuth(req, res, async (user, db) => {
        const tagIds = Array.isArray(req.body?.tagIds) ? req.body.tagIds.map(String) : [];
        const categoryId = req.body?.categoryId ? String(req.body.categoryId) : null;
        if (!ensureOwnedCategory(db, user.id, categoryId)) {
          res.status(400).json({ message: '分类不存在或无权使用' });
          return;
        }
        if (!ensureOwnedTags(db, user.id, tagIds)) {
          res.status(400).json({ message: '标签不存在或无权使用' });
          return;
        }

        const transaction: DevTransaction = {
          id: uid('tx'),
          userId: user.id,
          type: (req.body?.type ?? 'expense') as TransactionType,
          amount: Number(req.body?.amount ?? 0),
          categoryId,
          paymentMethod: String(req.body?.paymentMethod ?? ''),
          note: String(req.body?.note ?? ''),
          occurredAt: String(req.body?.occurredAt ?? new Date().toISOString()),
          createdAt: new Date().toISOString(),
          tagIds
        };
        db.transactions.push(transaction);
        res.status(201).json({ transaction });
      });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
    return;
  }

  if (pathname.startsWith('/api/transactions/')) {
    if (!['GET', 'PATCH', 'DELETE'].includes(req.method ?? '')) {
      methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
      return;
    }

    await withAuth(req, res, async (user, db) => {
      const id = pathname.split('/').pop()!;
      const transaction = db.transactions.find((item) => item.userId === user.id && item.id === id);
      if (!transaction) {
        res.status(404).json({ message: '账单不存在或无权访问' });
        return;
      }

      if (req.method === 'GET') {
        res.status(200).json({ transaction });
        return;
      }

      if (req.method === 'PATCH') {
        const tagIds = req.body?.tagIds ? req.body.tagIds.map(String) : transaction.tagIds;
        const categoryId = req.body?.categoryId === undefined ? transaction.categoryId : (req.body?.categoryId ? String(req.body.categoryId) : null);
        if (!ensureOwnedCategory(db, user.id, categoryId)) {
          res.status(400).json({ message: '分类不存在或无权使用' });
          return;
        }
        if (!ensureOwnedTags(db, user.id, tagIds)) {
          res.status(400).json({ message: '标签不存在或无权使用' });
          return;
        }

        Object.assign(transaction, {
          ...req.body,
          categoryId,
          tagIds
        });
        res.status(200).json({ transaction });
        return;
      }

      if (req.method === 'DELETE') {
        db.transactions = db.transactions.filter((item) => item.id !== id);
        res.status(200).json({ transaction });
        return;
      }
    });
    return;
  }

  res.status(404).json({ message: '接口不存在' });
}
