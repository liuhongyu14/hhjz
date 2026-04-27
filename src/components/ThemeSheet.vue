<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAppStore } from '../stores/app';
import type { ThemeName } from '../types';

const store = useAppStore();
const selected = ref<ThemeName>(store.theme);

watch(
  () => store.themeSheetOpen,
  (open) => {
    if (open) selected.value = store.theme;
  }
);
</script>

<template>
  <Transition name="fade">
    <div v-if="store.themeSheetOpen" class="sheet-mask" @click.self="store.themeSheetOpen = false">
      <section class="bottom-sheet theme-sheet">
        <span class="sheet-handle"></span>
        <h2>切换主题</h2>
        <p class="sheet-subtitle">切换后将应用到整个记账界面</p>
        <div class="theme-options">
          <button
            v-for="option in store.themeOptions"
            :key="option.name"
            class="theme-card"
            :class="[option.name, { selected: selected === option.name }]"
            type="button"
            @click="selected = option.name"
          >
            <span class="theme-preview">
              <i></i>
              <i></i>
              <i></i>
              <b></b>
            </span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </button>
        </div>
        <div class="sheet-actions">
          <button class="ghost-button" type="button" @click="store.themeSheetOpen = false">取消</button>
          <button class="primary-button" type="button" @click="store.setTheme(selected)">应用</button>
        </div>
      </section>
    </div>
  </Transition>
</template>
