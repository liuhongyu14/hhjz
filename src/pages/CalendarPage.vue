<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { calendarOutline, chevronBack, chevronDown, chevronForward } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import TransactionItem from '../components/TransactionItem.vue';
import { demoToday } from '../data/demo';
import { useAppStore } from '../stores/app';
import { dateKey, formatChineseDate, formatMoney, monthKey } from '../utils/format';

const store = useAppStore();
const router = useRouter();
const current = new Date(`${demoToday}T12:00:00`);
const selectedMonth = ref(monthKey(current));
const selectedDate = ref(dateKey(current));

function toDisplayMonth(value: string) {
  const [year, month] = value.split('-');
  return `${year}年${Number(month)}月`;
}

function shiftMonth(diff: number) {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const next = new Date(year, month - 1 + diff, 1);
  selectedMonth.value = monthKey(next);
  selectedDate.value = `${selectedMonth.value}-01`;
}

const monthTransactions = computed(() => store.transactionsByMonth(selectedMonth.value));
const dailyTransactions = computed(() => store.transactionsByDate(selectedDate.value));
const todayExpense = computed(() =>
  dailyTransactions.value.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
);

const days = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const total = lastDay.getDate();
  const result: Array<{ key: string; label: number; currentMonth: boolean; amount: number }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    const date = new Date(year, month - 1, -(startWeekday - i - 1));
    result.push({
      key: dateKey(date),
      label: date.getDate(),
      currentMonth: false,
      amount: 0
    });
  }

  for (let day = 1; day <= total; day += 1) {
    const key = `${selectedMonth.value}-${`${day}`.padStart(2, '0')}`;
    const amount = store
      .transactionsByDate(key)
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    result.push({ key, label: day, currentMonth: true, amount });
  }

  while (result.length % 7 !== 0) {
    const last = new Date(`${result[result.length - 1].key}T12:00:00`);
    last.setDate(last.getDate() + 1);
    result.push({
      key: dateKey(last),
      label: last.getDate(),
      currentMonth: false,
      amount: 0
    });
  }

  return result;
});
</script>

<template>
  <section class="screen">
    <header class="screen-titlebar">
      <button class="icon-button topbar-button" type="button" @click="router.back()">
        <IonIcon :icon="chevronBack" />
      </button>
      <h1>日历账单</h1>
      <button class="icon-button topbar-button" type="button">
        <IonIcon :icon="calendarOutline" />
      </button>
    </header>

    <section class="month-copy with-switch">
      <button class="icon-button mini-switch" type="button" @click="shiftMonth(-1)">
        <IonIcon :icon="chevronBack" />
      </button>
      <div>
        <strong class="month-title">
          <span>{{ toDisplayMonth(selectedMonth) }}</span>
          <IonIcon :icon="chevronDown" />
        </strong>
        <p>本月共 {{ monthTransactions.length }} 笔记录</p>
      </div>
      <button class="icon-button mini-switch" type="button" @click="shiftMonth(1)">
        <IonIcon :icon="chevronForward" />
      </button>
    </section>

    <section class="list-card">
      <div class="weekday-row">
        <span v-for="week in ['一', '二', '三', '四', '五', '六', '日']" :key="week">{{ week }}</span>
      </div>
      <div class="calendar-grid">
        <button
          v-for="day in days"
          :key="day.key"
          class="calendar-day"
          :class="{ muted: !day.currentMonth, selected: day.key === selectedDate }"
          type="button"
          @click="selectedDate = day.key"
        >
          <span>{{ day.label }}</span>
          <small v-if="day.amount">￥{{ day.amount }}</small>
          <i v-if="day.amount"></i>
        </button>
      </div>
    </section>

    <section class="list-card">
      <div class="section-title">
        <div>
          <h2>{{ formatChineseDate(`${selectedDate}T12:00:00`) }}</h2>
          <p>今日支出 {{ formatMoney(todayExpense) }}</p>
        </div>
      </div>
      <div v-if="dailyTransactions.length">
        <TransactionItem v-for="item in dailyTransactions" :key="item.id" :transaction="item" />
      </div>
      <div v-else class="empty-block">
        <strong>这一天还没有账单</strong>
        <p>换一天看看，或登录后记下你的第一笔。</p>
      </div>
    </section>
  </section>
</template>
