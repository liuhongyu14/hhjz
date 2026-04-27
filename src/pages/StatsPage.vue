<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { calendarOutline, chevronBack, chevronDown, chevronForward } from 'ionicons/icons';
import { demoToday } from '../data/demo';
import { useAppStore } from '../stores/app';
import { formatMoney, monthKey } from '../utils/format';

const store = useAppStore();
const selectedMonth = ref(monthKey(demoToday));

const summary = computed(() => store.summaryForMonth(selectedMonth.value));
const stats = computed(() => store.categoryStats(selectedMonth.value));

function shiftMonth(diff: number) {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const next = new Date(year, month - 1 + diff, 1);
  selectedMonth.value = monthKey(next);
}

const donutStyle = computed(() => {
  const segments: string[] = [];
  let cursor = 0;
  stats.value.forEach((item) => {
    const next = cursor + item.percent;
    segments.push(`${item.category.color} ${cursor}% ${next}%`);
    cursor = next;
  });
  if (!segments.length) {
    segments.push('#dbeafe 0% 100%');
  } else if (cursor < 100) {
    segments.push(`#eef3ff ${cursor}% 100%`);
  }
  return { background: `conic-gradient(${segments.join(', ')})` };
});

function displayMonth(value: string) {
  const [year, month] = value.split('-');
  return `${year}年${Number(month)}月`;
}
</script>

<template>
  <section class="screen">
    <header class="screen-titlebar">
      <span class="topbar-spacer"></span>
      <h1>收支统计</h1>
      <button class="icon-button topbar-button" type="button">
        <IonIcon :icon="calendarOutline" />
      </button>
    </header>

    <section class="month-copy with-switch compact">
      <button class="icon-button mini-switch" type="button" @click="shiftMonth(-1)">
        <IonIcon :icon="chevronBack" />
      </button>
      <strong class="month-title center">
        <span>{{ displayMonth(selectedMonth) }}</span>
        <IonIcon :icon="chevronDown" />
      </strong>
      <button class="icon-button mini-switch" type="button" @click="shiftMonth(1)">
        <IonIcon :icon="chevronForward" />
      </button>
    </section>

    <section class="metric-grid">
      <article class="metric-card frosted-card">
        <small>总支出</small>
        <strong>{{ formatMoney(summary.expense) }}</strong>
      </article>
      <article class="metric-card frosted-card">
        <small>总收入</small>
        <strong class="income-text">{{ formatMoney(summary.income) }}</strong>
      </article>
      <article class="metric-card frosted-card">
        <small>记录笔数</small>
        <strong>{{ summary.count }}</strong>
      </article>
    </section>

    <section class="chart-card list-card">
      <h2>支出分类占比</h2>
      <div class="chart-panel">
        <div class="donut-chart" :style="donutStyle">
          <div class="donut-inner">
            <strong>{{ formatMoney(summary.expense) }}</strong>
            <small>总支出</small>
          </div>
        </div>
        <div class="legend-list">
          <div v-for="item in stats" :key="item.category.id" class="legend-item">
            <span class="legend-dot" :style="{ backgroundColor: item.category.color }"></span>
            <span>{{ item.category.name }}</span>
            <strong>{{ item.percent }}%</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="list-card">
      <h2>支出分类详情</h2>
      <div v-for="item in stats" :key="item.category.id" class="progress-row">
        <div class="progress-label">
          <span class="category-chip" :style="{ color: item.category.color, backgroundColor: `${item.category.color}18` }">
            {{ item.category.icon }}
          </span>
          <div>
            <strong>{{ item.category.name }}</strong>
            <p>{{ formatMoney(item.amount) }}</p>
          </div>
        </div>
        <div class="progress-meta">
          <strong>{{ item.percent }}%</strong>
          <span class="progress-bar">
            <i :style="{ width: `${item.percent}%`, backgroundColor: item.category.color }"></i>
          </span>
        </div>
      </div>
    </section>
  </section>
</template>
