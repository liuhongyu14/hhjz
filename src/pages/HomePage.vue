<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { calendarOutline, colorPalette, grid, pencil, pricetag } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import TransactionItem from '../components/TransactionItem.vue';
import { demoToday } from '../data/demo';
import { useAppStore } from '../stores/app';
import { formatMoney, monthKey } from '../utils/format';

const router = useRouter();
const store = useAppStore();
const currentMonth = monthKey(demoToday);

const summary = computed(() => store.summaryForMonth(currentMonth));
const recentTransactions = computed(() => [...summary.value.list].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 5));

const shortcuts = [
  {
    label: '记一笔',
    icon: pencil,
    tone: 'blue',
    action: () => store.requireAuth(() => router.push('/entry'), '记一笔')
  },
  {
    label: '分类',
    icon: grid,
    tone: 'orange',
    action: () => store.requireAuth(() => router.push('/categories'), '管理分类')
  },
  {
    label: '标签',
    icon: pricetag,
    tone: 'purple',
    action: () => store.requireAuth(() => router.push('/tags'), '管理标签')
  },
  {
    label: '主题',
    icon: colorPalette,
    tone: 'green',
    action: () => store.openThemeSheet()
  }
];
</script>

<template>
  <section class="screen home-screen">
    <div class="hero-card">
      <div class="hero-content">
        <h1>好好记账</h1>
        <p>{{ store.isLoggedIn ? '4 月支出清晰可见' : '先看看，喜欢再登录' }}</p>
      </div>
      <button class="mini-icon" type="button" @click="$router.push('/calendar')">
        <IonIcon :icon="calendarOutline" />
      </button>
      <div class="hero-book"></div>
    </div>

    <article class="balance-card frosted-card">
      <div class="balance-header">
        <span>{{ store.isLoggedIn ? '本月结余' : '演示账本（数据仅展示）' }}</span>
        <span class="month-pill">4 月</span>
      </div>
      <strong class="balance-amount">{{ formatMoney(summary.balance) }}</strong>
      <div class="summary-grid">
        <div>
          <small>本月收入</small>
          <strong class="income-text">{{ formatMoney(summary.income) }}</strong>
        </div>
        <div>
          <small>本月支出</small>
          <strong>{{ formatMoney(summary.expense) }}</strong>
        </div>
      </div>
    </article>

    <section class="shortcut-grid">
      <button v-for="item in shortcuts" :key="item.label" class="shortcut-card frosted-card" type="button" @click="item.action">
        <span class="shortcut-icon" :class="item.tone">
          <IonIcon :icon="item.icon" />
        </span>
        <span>{{ item.label }}</span>
      </button>
    </section>

    <section class="list-card">
      <div class="section-title">
        <h2>最近账单</h2>
        <button class="link-button" type="button" @click="$router.push('/calendar')">全部</button>
      </div>
      <TransactionItem v-for="item in recentTransactions" :key="item.id" :transaction="item" />
    </section>
  </section>
</template>
