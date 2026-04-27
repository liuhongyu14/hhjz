export type ThemeName = 'light' | 'dark' | 'warm';

export type TransactionType = 'expense' | 'income';

export interface User {
  id: string;
  account: string;
  nickname: string;
  avatar: string;
  theme: ThemeName;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
  type: TransactionType | 'both';
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  paymentMethod: string;
  note: string;
  occurredAt: string;
  createdAt: string;
  tagIds: string[];
}

export interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
}
