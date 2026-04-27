import type { Category, Tag, ThemeOption, Transaction } from '../types';

export const demoToday = '2026-04-28';

export const themeOptions: ThemeOption[] = [
  { name: 'light', label: '浅色主题', description: '清爽蓝白，适合日常使用' },
  { name: 'dark', label: '深色主题', description: '低亮深色，夜间查看更舒服' },
  { name: 'warm', label: '暖色主题', description: '米白暖调，弱化数字压力' }
];

export const defaultCategories: Category[] = [
  {
    id: 'food',
    name: '餐饮',
    icon: '🍜',
    color: '#ff7a1a',
    description: '早餐、午餐、咖啡与外卖',
    sortOrder: 1,
    type: 'expense',
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 'traffic',
    name: '交通',
    icon: '🚇',
    color: '#2878ff',
    description: '地铁、公交、打车与通勤',
    sortOrder: 2,
    type: 'expense',
    createdAt: '2026-04-01T08:01:00.000Z'
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛒',
    color: '#ff9f0a',
    description: '生活用品、网购与超市',
    sortOrder: 3,
    type: 'expense',
    createdAt: '2026-04-01T08:02:00.000Z'
  },
  {
    id: 'entertainment',
    name: '娱乐',
    icon: '🎬',
    color: '#8a5cf6',
    description: '电影、游戏、演出与会员',
    sortOrder: 4,
    type: 'expense',
    createdAt: '2026-04-01T08:03:00.000Z'
  },
  {
    id: 'study',
    name: '学习',
    icon: '📚',
    color: '#20c777',
    description: '课程、书籍与资料',
    sortOrder: 5,
    type: 'expense',
    createdAt: '2026-04-01T08:04:00.000Z'
  },
  {
    id: 'medical',
    name: '医疗',
    icon: '💊',
    color: '#22c55e',
    description: '看诊、药品与体检',
    sortOrder: 6,
    type: 'expense',
    createdAt: '2026-04-01T08:05:00.000Z'
  },
  {
    id: 'housing',
    name: '居住',
    icon: '🏠',
    color: '#f97316',
    description: '房租、物业与家庭支出',
    sortOrder: 7,
    type: 'expense',
    createdAt: '2026-04-01T08:06:00.000Z'
  },
  {
    id: 'salary',
    name: '工资',
    icon: '💼',
    color: '#20c777',
    description: '固定薪资收入',
    sortOrder: 8,
    type: 'income',
    createdAt: '2026-04-01T08:07:00.000Z'
  },
  {
    id: 'bonus',
    name: '奖金',
    icon: '🎁',
    color: '#f43f7b',
    description: '奖金、补贴与红包',
    sortOrder: 9,
    type: 'income',
    createdAt: '2026-04-01T08:08:00.000Z'
  }
];

export const defaultTags: Tag[] = [
  { id: 'commute', name: '通勤', color: '#2878ff', createdAt: '2026-04-01T09:00:00.000Z' },
  { id: 'coffee', name: '咖啡', color: '#ef3b16', createdAt: '2026-04-01T09:01:00.000Z' },
  { id: 'takeout', name: '外卖', color: '#ffb400', createdAt: '2026-04-01T09:02:00.000Z' },
  { id: 'study-tag', name: '学习', color: '#20c777', createdAt: '2026-04-01T09:03:00.000Z' },
  { id: 'travel', name: '旅行', color: '#8a5cf6', createdAt: '2026-04-01T09:04:00.000Z' },
  { id: 'gift', name: '礼物', color: '#f43f7b', createdAt: '2026-04-01T09:05:00.000Z' },
  { id: 'pet', name: '宠物', color: '#2f9cf5', createdAt: '2026-04-01T09:06:00.000Z' },
  { id: 'home', name: '家庭', color: '#ff7a1a', createdAt: '2026-04-01T09:07:00.000Z' },
  { id: 'claim', name: '报销', color: '#21c6c0', createdAt: '2026-04-01T09:08:00.000Z' },
  { id: 'date', name: '约会', color: '#f43f7b', createdAt: '2026-04-01T09:09:00.000Z' },
  { id: 'sport', name: '运动', color: '#2f9cf5', createdAt: '2026-04-01T09:10:00.000Z' },
  { id: 'movie', name: '娱乐', color: '#8a5cf6', createdAt: '2026-04-01T09:11:00.000Z' },
  { id: 'shopping-tag', name: '购物', color: '#ff9f0a', createdAt: '2026-04-01T09:12:00.000Z' },
  { id: 'health', name: '医疗', color: '#20c777', createdAt: '2026-04-01T09:13:00.000Z' },
  { id: 'rent', name: '房租', color: '#64748b', createdAt: '2026-04-01T09:14:00.000Z' },
  { id: 'snack', name: '零食', color: '#fb7185', createdAt: '2026-04-01T09:15:00.000Z' },
  { id: 'friend', name: '朋友', color: '#14b8a6', createdAt: '2026-04-01T09:16:00.000Z' },
  { id: 'more', name: '更多', color: '#94a3b8', createdAt: '2026-04-01T09:17:00.000Z' }
];

export const demoTransactions: Transaction[] = [
  {
    id: 'tx-salary',
    type: 'income',
    amount: 12000,
    categoryId: 'salary',
    paymentMethod: '银行卡',
    note: '4 月工资',
    occurredAt: '2026-04-26T18:00:00.000Z',
    createdAt: '2026-04-26T18:04:00.000Z',
    tagIds: []
  },
  {
    id: 'tx-rent',
    type: 'expense',
    amount: 5168,
    categoryId: 'housing',
    paymentMethod: '银行卡',
    note: '房租',
    occurredAt: '2026-04-01T09:00:00.000Z',
    createdAt: '2026-04-01T09:02:00.000Z',
    tagIds: ['rent']
  },
  {
    id: 'tx-lunch',
    type: 'expense',
    amount: 32,
    categoryId: 'food',
    paymentMethod: '支付宝',
    note: '午餐',
    occurredAt: '2026-04-28T12:30:00.000Z',
    createdAt: '2026-04-28T12:31:00.000Z',
    tagIds: ['takeout']
  },
  {
    id: 'tx-metro',
    type: 'expense',
    amount: 6,
    categoryId: 'traffic',
    paymentMethod: '交通卡',
    note: '地铁',
    occurredAt: '2026-04-28T08:15:00.000Z',
    createdAt: '2026-04-28T08:16:00.000Z',
    tagIds: ['commute']
  },
  {
    id: 'tx-breakfast',
    type: 'expense',
    amount: 18,
    categoryId: 'food',
    paymentMethod: '微信支付',
    note: '早餐',
    occurredAt: '2026-04-27T08:15:00.000Z',
    createdAt: '2026-04-27T08:16:00.000Z',
    tagIds: []
  },
  {
    id: 'tx-taxi',
    type: 'expense',
    amount: 24,
    categoryId: 'traffic',
    paymentMethod: '微信支付',
    note: '打车',
    occurredAt: '2026-04-27T09:30:00.000Z',
    createdAt: '2026-04-27T09:32:00.000Z',
    tagIds: ['commute']
  },
  {
    id: 'tx-coffee',
    type: 'expense',
    amount: 32,
    categoryId: 'food',
    paymentMethod: '支付宝',
    note: '咖啡',
    occurredAt: '2026-04-27T10:42:00.000Z',
    createdAt: '2026-04-27T10:43:00.000Z',
    tagIds: ['coffee']
  },
  {
    id: 'tx-shopping',
    type: 'expense',
    amount: 320,
    categoryId: 'shopping',
    paymentMethod: '银行卡',
    note: '生活用品',
    occurredAt: '2026-04-22T20:12:00.000Z',
    createdAt: '2026-04-22T20:14:00.000Z',
    tagIds: ['home']
  },
  {
    id: 'tx-movie',
    type: 'expense',
    amount: 200,
    categoryId: 'entertainment',
    paymentMethod: '支付宝',
    note: '周末电影',
    occurredAt: '2026-04-14T19:20:00.000Z',
    createdAt: '2026-04-14T19:21:00.000Z',
    tagIds: ['movie']
  },
  {
    id: 'tx-book',
    type: 'expense',
    amount: 156,
    categoryId: 'study',
    paymentMethod: '微信支付',
    note: '新书',
    occurredAt: '2026-04-06T15:30:00.000Z',
    createdAt: '2026-04-06T15:31:00.000Z',
    tagIds: ['study-tag']
  },
  {
    id: 'tx-medicine',
    type: 'expense',
    amount: 80,
    categoryId: 'medical',
    paymentMethod: '医保卡',
    note: '常用药',
    occurredAt: '2026-04-18T11:20:00.000Z',
    createdAt: '2026-04-18T11:21:00.000Z',
    tagIds: ['health']
  },
  {
    id: 'tx-small',
    type: 'expense',
    amount: 28,
    categoryId: 'shopping',
    paymentMethod: '支付宝',
    note: '文具',
    occurredAt: '2026-04-24T16:10:00.000Z',
    createdAt: '2026-04-24T16:11:00.000Z',
    tagIds: ['study-tag']
  },
  {
    id: 'tx-snack',
    type: 'expense',
    amount: 74,
    categoryId: 'food',
    paymentMethod: '微信支付',
    note: '零食补货',
    occurredAt: '2026-04-27T21:10:00.000Z',
    createdAt: '2026-04-27T21:11:00.000Z',
    tagIds: ['snack']
  }
];
