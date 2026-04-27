import { relations } from 'drizzle-orm';
import { integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const transactionType = pgEnum('transaction_type', ['expense', 'income']);
export const categoryType = pgEnum('category_type', ['expense', 'income', 'both']);
export const themeName = pgEnum('theme_name', ['light', 'dark', 'warm']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  account: text('account').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nickname: text('nickname').notNull().default('好好记账'),
  avatar: text('avatar').notNull().default('👩🏻'),
  theme: themeName('theme').notNull().default('light'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  description: text('description').notNull().default(''),
  type: categoryType('type').notNull().default('expense'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: transactionType('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  paymentMethod: text('payment_method').notNull(),
  note: text('note').notNull().default(''),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const transactionTags = pgTable('transaction_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' })
});

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  tags: many(tags),
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  }),
  tagLinks: many(transactionTags)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  }),
  transactions: many(transactions)
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id]
  }),
  transactionLinks: many(transactionTags)
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionTags.transactionId],
    references: [transactions.id]
  }),
  tag: one(tags, {
    fields: [transactionTags.tagId],
    references: [tags.id]
  })
}));
