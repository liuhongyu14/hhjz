import type { Transaction } from '../types';

export function formatMoney(value: number): string {
  return `￥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatSignedMoney(transaction: Transaction): string {
  const sign = transaction.type === 'income' ? '+' : '-';
  return `${sign}${formatMoney(transaction.amount)}`;
}

export function dateKey(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const year = target.getFullYear();
  const month = `${target.getMonth() + 1}`.padStart(2, '0');
  const day = `${target.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthKey(date: string | Date): string {
  return dateKey(date).slice(0, 7);
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatChineseDate(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

