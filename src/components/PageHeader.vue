<script setup lang="ts">
import { useRouter } from 'vue-router';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    back?: boolean;
    actionLabel?: string;
    actionIcon?: string;
  }>(),
  {
    subtitle: '',
    back: false,
    actionLabel: '',
    actionIcon: ''
  }
);

const emit = defineEmits<{
  action: [];
}>();

const router = useRouter();
</script>

<template>
  <header class="page-header">
    <button v-if="back" class="icon-button back-button" type="button" @click="router.back()">‹</button>
    <div class="page-heading">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <button v-if="actionLabel" class="header-action" type="button" @click="emit('action')">
      <span v-if="actionIcon">{{ actionIcon }}</span>
      {{ actionLabel }}
    </button>
  </header>
</template>

