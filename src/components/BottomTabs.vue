<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  add,
  calendar,
  calendarOutline,
  home,
  homeOutline,
  person,
  personOutline,
  pieChart,
  pieChartOutline
} from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const activeTab = computed(() => route.meta.tab);

const tabs = [
  { key: 'home', label: '首页', icon: homeOutline, activeIcon: home, path: '/home' },
  { key: 'calendar', label: '日历', icon: calendarOutline, activeIcon: calendar, path: '/calendar' },
  { key: 'entry', label: '记一笔', icon: add, activeIcon: add, path: '/entry', primary: true },
  { key: 'stats', label: '统计', icon: pieChartOutline, activeIcon: pieChart, path: '/stats' },
  { key: 'profile', label: '我的', icon: personOutline, activeIcon: person, path: '/profile' }
];

function navigate(tab: (typeof tabs)[number]) {
  if (tab.key === 'entry') {
    store.requireAuth(() => router.push(tab.path), '记一笔');
    return;
  }
  router.push(tab.path);
}
</script>

<template>
  <nav class="bottom-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-button"
      :class="{ active: activeTab === tab.key, primary: tab.primary }"
      type="button"
      @click="navigate(tab)"
    >
      <span class="tab-icon">
        <IonIcon :icon="activeTab === tab.key ? tab.activeIcon : tab.icon" />
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>
