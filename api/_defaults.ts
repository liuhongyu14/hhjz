type NewCategory = {
  name: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
  type: 'expense' | 'income' | 'both';
};

type NewTag = {
  name: string;
  color: string;
};

export const defaultCategoryRows: NewCategory[] = [
  { name: '餐饮', icon: '🍜', color: '#ff7a1a', description: '早餐、午餐、咖啡与外卖', sortOrder: 1, type: 'expense' },
  { name: '交通', icon: '🚇', color: '#2878ff', description: '地铁、公交、打车与通勤', sortOrder: 2, type: 'expense' },
  { name: '购物', icon: '🛒', color: '#ff9f0a', description: '生活用品、网购与超市', sortOrder: 3, type: 'expense' },
  { name: '娱乐', icon: '🎬', color: '#8a5cf6', description: '电影、游戏、演出与会员', sortOrder: 4, type: 'expense' },
  { name: '学习', icon: '📚', color: '#20c777', description: '课程、书籍与资料', sortOrder: 5, type: 'expense' },
  { name: '医疗', icon: '💊', color: '#22c55e', description: '看诊、药品与体检', sortOrder: 6, type: 'expense' },
  { name: '居住', icon: '🏠', color: '#f97316', description: '房租、物业与家庭支出', sortOrder: 7, type: 'expense' },
  { name: '工资', icon: '💼', color: '#20c777', description: '固定薪资收入', sortOrder: 8, type: 'income' },
  { name: '奖金', icon: '🎁', color: '#f43f7b', description: '奖金、补贴与红包', sortOrder: 9, type: 'income' }
];

export const defaultTagRows: NewTag[] = [
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
