<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonApp } from '@ionic/vue';
import { RouterView, useRoute } from 'vue-router';
import BottomTabs from './components/BottomTabs.vue';
import LoginPrompt from './components/LoginPrompt.vue';
import ThemeSheet from './components/ThemeSheet.vue';
import AppToast from './components/AppToast.vue';
import { useAppStore } from './stores/app';

const route = useRoute();
const store = useAppStore();

const showTab = computed(() => Boolean(route.meta.showTab));

onMounted(() => {
  void store.bootstrap();
});
</script>

<template>
  <IonApp>
    <main class="app-frame" :class="{ 'has-tab': showTab }">
      <RouterView />
      <BottomTabs v-if="showTab" />
    </main>
    <LoginPrompt />
    <ThemeSheet />
    <AppToast :message="store.toast" />
  </IonApp>
</template>
