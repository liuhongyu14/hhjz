import { z } from 'zod';

export const accountSchema = z.string().trim().min(3).max(80);
export const passwordSchema = z.string().min(6).max(72);
export const uuidSchema = z.string().uuid();

export const authSchema = z.object({
  account: accountSchema,
  password: passwordSchema
});

export const themeSchema = z.enum(['light', 'dark', 'warm']);

export const updateMeSchema = z.object({
  nickname: z.string().trim().min(1).max(24).optional(),
  avatar: z.string().trim().min(1).max(20).optional(),
  theme: themeSchema.optional()
});

export const categoryTypeSchema = z.enum(['expense', 'income', 'both']);

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(12),
  icon: z.string().trim().min(1).max(8),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().trim().max(40).default(''),
  type: categoryTypeSchema.default('expense'),
  sortOrder: z.number().int().min(0).max(9999).optional()
});

export const updateCategorySchema = categorySchema.partial();

export const tagSchema = z.object({
  name: z.string().trim().min(1).max(12),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const updateTagSchema = tagSchema.partial();

const dateTimeSchema = z.string().datetime();

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().positive().max(99999999),
  categoryId: uuidSchema.nullish(),
  paymentMethod: z.string().trim().min(1).max(24),
  note: z.string().trim().max(80).default(''),
  occurredAt: dateTimeSchema,
  tagIds: z.array(uuidSchema).max(20).default([])
});

export const updateTransactionSchema = transactionSchema.partial();
