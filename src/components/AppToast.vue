<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <Transition name="toast">
    <div v-if="message" class="app-toast">{{ message }}</div>
  </Transition>
</template>

