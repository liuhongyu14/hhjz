import { computed, reactive, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { defaultCategories, defaultTags, demoTransactions, themeOptions } from '../data/demo';
import { api, ApiError } from '../services/api';
import type { Category, Tag, ThemeName, Transaction, TransactionType, User } from '../types';
import { dateKey, monthKey } from '../utils/format';

const STORAGE_KEYS = {
  user: 'haohao:user',
  theme: 'haohao:theme'
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dateToApiDateTime(date: string) {
  return new Date(`${date}T12:00:00`).toISOString();
}

const uncategorizedCategory: Category = {
  id: 'uncategorized',
  name: '未分类',
  icon: '🧾',
  color: '#94a3b8',
  description: '该账单暂未关联分类',
  sortOrder: 9999,
  type: 'both',
  createdAt: new Date(0).toISOString()
};

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

interface ListResponse<T> {
  list: T[];
}

interface CategoryResponse {
  category: Category;
}

interface TagResponse {
  tag: Tag;
}

interface TransactionResponse {
  transaction: Transaction;
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeName>(load(STORAGE_KEYS.theme, 'light'));
  const user = ref<User | null>(load(STORAGE_KEYS.user, null));
  const categories = ref<Category[]>(defaultCategories);
  const tags = ref<Tag[]>(defaultTags);
  const transactions = ref<Transaction[]>(demoTransactions);
  const loginPrompt = reactive({ open: false, intent: '继续操作' });
  const themeSheetOpen = ref(false);
  const toast = ref('');
  const bootstrapped = ref(false);
  const loading = ref(false);

  const isLoggedIn = computed(() => Boolean(user.value));
  const themeLabel = computed(() => themeOptions.find((item) => item.name === theme.value)?.label.replace('主题', '') ?? '浅色');
  const sortedCategories = computed(() => [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder));
  const sortedTags = computed(() => [...tags.value].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));

  function applyTheme(nextTheme = theme.value) {
    document.documentElement.dataset.theme = nextTheme;
  }

  watch(theme, (value) => {
    persist(STORAGE_KEYS.theme, value);
    applyTheme(value);
  }, { immediate: true });

  watch(user, (value) => persist(STORAGE_KEYS.user, value), { deep: true });

  function showToast(message: string) {
    toast.value = message;
    window.setTimeout(() => {
      if (toast.value === message) toast.value = '';
    }, 2200);
  }

  function showApiError(error: unknown, fallback = '请求失败，请稍后再试') {
    showToast(error instanceof ApiError ? error.message : fallback);
  }

  function resetGuestData() {
    categories.value = defaultCategories;
    tags.value = defaultTags;
    transactions.value = demoTransactions;
  }

  async function refreshWorkspace() {
    if (!user.value) {
      resetGuestData();
      return;
    }

    const [categoryData, tagData, transactionData] = await Promise.all([
      api.get<ListResponse<Category>>('/api/categories'),
      api.get<ListResponse<Tag>>('/api/tags'),
      api.get<ListResponse<Transaction>>('/api/transactions')
    ]);

    categories.value = categoryData.list;
    tags.value = tagData.list;
    transactions.value = transactionData.list;
  }

  async function bootstrap() {
    if (bootstrapped.value) return;
    bootstrapped.value = true;

    if (!user.value) {
      resetGuestData();
      return;
    }

    loading.value = true;
    try {
      const data = await api.get<MeResponse>('/api/me');
      user.value = data.user;
      theme.value = data.user.theme;
      await refreshWorkspace();
    } catch (error) {
      user.value = null;
      resetGuestData();
      if (error instanceof ApiError && error.status === 401) {
        return;
      }
      showApiError(error, '无法连接后端，已切换为游客演示数据');
    } finally {
      loading.value = false;
    }
  }

  function requireAuth(action?: () => void, intent = '继续操作') {
    if (!isLoggedIn.value) {
      loginPrompt.intent = intent;
      loginPrompt.open = true;
      return false;
    }
    action?.();
    return true;
  }

  function closeLoginPrompt() {
    loginPrompt.open = false;
  }

  async function login(account: string, password: string) {
    if (!account.trim() || password.length < 6) {
      showToast('请输入账号和至少 6 位密码');
      return false;
    }

    loading.value = true;
    try {
      const data = await api.post<AuthResponse>('/api/auth/login', { account, password });
      user.value = data.user;
      theme.value = data.user.theme;
      closeLoginPrompt();
      await refreshWorkspace();
      showToast('登录成功，欢迎回来');
      return true;
    } catch (error) {
      showApiError(error, '登录失败，请稍后再试');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(account: string, password: string, confirmPassword: string, agreed: boolean) {
    if (!account.trim() || password.length < 6) {
      showToast('请填写账号，并设置至少 6 位密码');
      return false;
    }
    if (password !== confirmPassword) {
      showToast('两次密码不一致');
      return false;
    }
    if (!agreed) {
      showToast('请先阅读并同意用户协议');
      return false;
    }

    loading.value = true;
    try {
      const data = await api.post<AuthResponse>('/api/auth/register', { account, password });
      user.value = data.user;
      theme.value = data.user.theme;
      await refreshWorkspace();
      showToast('注册成功，已自动登录');
      return true;
    } catch (error) {
      showApiError(error, '注册失败，请稍后再试');
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Local state should still reset even if the session cookie already expired.
    }
    user.value = null;
    resetGuestData();
    showToast('已退出登录，当前为游客模式');
  }

  function openThemeSheet() {
    requireAuth(() => {
      themeSheetOpen.value = true;
    }, '切换主题');
  }

  async function setTheme(nextTheme: ThemeName) {
    if (!user.value) {
      theme.value = nextTheme;
      themeSheetOpen.value = false;
      return;
    }

    const previousTheme = theme.value;
    theme.value = nextTheme;
    try {
      const data = await api.patch<MeResponse>('/api/me', { theme: nextTheme });
      user.value = data.user;
      theme.value = data.user.theme;
      themeSheetOpen.value = false;
      showToast('主题已应用到全局界面');
    } catch (error) {
      theme.value = previousTheme;
      showApiError(error, '主题保存失败');
    }
  }

  function getCategory(categoryId: string | null) {
    return categories.value.find((item) => item.id === categoryId) ?? uncategorizedCategory;
  }

  function transactionsByMonth(targetMonth: string) {
    return transactions.value.filter((item) => monthKey(item.occurredAt) === targetMonth);
  }

  function transactionsByDate(targetDate: string) {
    return transactions.value.filter((item) => dateKey(item.occurredAt) === targetDate);
  }

  function summaryForMonth(targetMonth: string) {
    const list = transactionsByMonth(targetMonth);
    const income = list.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expense = list.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return {
      list,
      income,
      expense,
      balance: income - expense,
      count: list.length
    };
  }

  function categoryStats(targetMonth: string) {
    const expenseList = transactionsByMonth(targetMonth).filter((item) => item.type === 'expense');
    const total = expenseList.reduce((sum, item) => sum + item.amount, 0);
    return sortedCategories.value
      .filter((item) => item.type !== 'income')
      .map((category) => {
        const amount = expenseList
          .filter((item) => item.categoryId === category.id)
          .reduce((sum, item) => sum + item.amount, 0);
        return {
          category,
          amount,
          percent: total ? Math.round((amount / total) * 100) : 0
        };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  async function addTransaction(payload: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    occurredAt: string;
    paymentMethod: string;
    note: string;
    tagIds: string[];
  }) {
    try {
      const data = await api.post<TransactionResponse>('/api/transactions', {
        ...payload,
        occurredAt: dateToApiDateTime(payload.occurredAt)
      });
      transactions.value = [data.transaction, ...transactions.value];
      showToast('已保存这一笔');
      return true;
    } catch (error) {
      showApiError(error, '账单保存失败');
      return false;
    }
  }

  async function addCategory(payload: Omit<Category, 'id' | 'createdAt' | 'sortOrder'>) {
    try {
      const data = await api.post<CategoryResponse>('/api/categories', {
        ...payload,
        sortOrder: categories.value.length + 1
      });
      categories.value = [...categories.value, data.category];
      showToast('分类已新增');
      return true;
    } catch (error) {
      showApiError(error, '分类新增失败');
      return false;
    }
  }

  async function updateCategory(id: string, payload: Partial<Omit<Category, 'id' | 'createdAt'>>) {
    try {
      const data = await api.patch<CategoryResponse>(`/api/categories/${id}`, payload);
      categories.value = categories.value.map((item) => (item.id === id ? data.category : item));
      showToast('分类已更新');
      return true;
    } catch (error) {
      showApiError(error, '分类更新失败');
      return false;
    }
  }

  async function deleteCategory(id: string) {
    try {
      await api.delete<CategoryResponse>(`/api/categories/${id}`);
      categories.value = categories.value.filter((item) => item.id !== id);
      transactions.value = transactions.value.map((item) => (item.categoryId === id ? { ...item, categoryId: null } : item));
      showToast('分类已删除');
      return true;
    } catch (error) {
      showApiError(error, '分类删除失败');
      return false;
    }
  }

  async function moveCategory(id: string, direction: 'up' | 'down') {
    const list = [...sortedCategories.value];
    const index = list.findIndex((item) => item.id === id);
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return false;

    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
    const reordered = list.map((item, order) => ({ ...item, sortOrder: order + 1 }));
    categories.value = reordered;

    try {
      await Promise.all(reordered.map((item) => api.patch(`/api/categories/${item.id}`, { sortOrder: item.sortOrder })));
      return true;
    } catch (error) {
      showApiError(error, '分类排序保存失败');
      await refreshWorkspace();
      return false;
    }
  }

  async function addTag(payload: Omit<Tag, 'id' | 'createdAt'>) {
    try {
      const data = await api.post<TagResponse>('/api/tags', payload);
      tags.value = [...tags.value, data.tag];
      showToast('标签已新增');
      return true;
    } catch (error) {
      showApiError(error, '标签新增失败');
      return false;
    }
  }

  async function updateTag(id: string, payload: Partial<Omit<Tag, 'id' | 'createdAt'>>) {
    try {
      const data = await api.patch<TagResponse>(`/api/tags/${id}`, payload);
      tags.value = tags.value.map((item) => (item.id === id ? data.tag : item));
      showToast('标签已更新');
      return true;
    } catch (error) {
      showApiError(error, '标签更新失败');
      return false;
    }
  }

  async function deleteTag(id: string) {
    try {
      await api.delete<TagResponse>(`/api/tags/${id}`);
      tags.value = tags.value.filter((item) => item.id !== id);
      transactions.value = transactions.value.map((item) => ({
        ...item,
        tagIds: item.tagIds.filter((tagId) => tagId !== id)
      }));
      showToast('标签已删除');
      return true;
    } catch (error) {
      showApiError(error, '标签删除失败');
      return false;
    }
  }

  return {
    theme,
    themeLabel,
    themeOptions,
    user,
    categories,
    sortedCategories,
    tags,
    sortedTags,
    transactions,
    loginPrompt,
    themeSheetOpen,
    toast,
    bootstrapped,
    loading,
    isLoggedIn,
    bootstrap,
    refreshWorkspace,
    showToast,
    requireAuth,
    closeLoginPrompt,
    login,
    register,
    logout,
    openThemeSheet,
    setTheme,
    getCategory,
    transactionsByMonth,
    transactionsByDate,
    summaryForMonth,
    categoryStats,
    addTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    addTag,
    updateTag,
    deleteTag
  };
});
