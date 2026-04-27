import type { categories, tags, transactionTags, transactions, users } from '../drizzle/schema.js';

type UserRow = typeof users.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;
type TagRow = typeof tags.$inferSelect;
type TransactionRow = typeof transactions.$inferSelect;
type TransactionTagRow = typeof transactionTags.$inferSelect;

export function serializeUser(user: Pick<UserRow, 'id' | 'account' | 'nickname' | 'avatar' | 'theme' | 'createdAt'>) {
  return {
    id: user.id,
    account: user.account,
    nickname: user.nickname === '小鹿记账' ? user.account : user.nickname,
    avatar: user.avatar,
    theme: user.theme,
    createdAt: user.createdAt.toISOString()
  };
}

export function serializeCategory(category: CategoryRow) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    description: category.description,
    sortOrder: category.sortOrder,
    type: category.type,
    createdAt: category.createdAt.toISOString()
  };
}

export function serializeTag(tag: TagRow) {
  return {
    id: tag.id,
    userId: tag.userId,
    name: tag.name,
    color: tag.color,
    createdAt: tag.createdAt.toISOString()
  };
}

export function serializeTransaction(transaction: TransactionRow, links: TransactionTagRow[] = []) {
  return {
    id: transaction.id,
    userId: transaction.userId,
    type: transaction.type,
    amount: Number(transaction.amount),
    categoryId: transaction.categoryId,
    paymentMethod: transaction.paymentMethod,
    note: transaction.note,
    occurredAt: transaction.occurredAt.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    tagIds: links.filter((link) => link.transactionId === transaction.id).map((link) => link.tagId)
  };
}
