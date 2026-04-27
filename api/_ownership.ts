import { and, eq, inArray } from 'drizzle-orm';
import { db } from './_db.js';
import { categories, tags } from '../drizzle/schema.js';

export async function ensureOwnedCategory(userId: string, categoryId?: string | null) {
  if (!categoryId) return null;

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId))
  });

  return category ?? null;
}

export async function ensureOwnedTags(userId: string, tagIds: string[]) {
  const uniqueIds = Array.from(new Set(tagIds));
  if (!uniqueIds.length) return [];

  const rows = await db.query.tags.findMany({
    where: and(eq(tags.userId, userId), inArray(tags.id, uniqueIds))
  });

  return rows.length === uniqueIds.length ? rows : null;
}
