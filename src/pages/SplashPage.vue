<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  window.setTimeout(() => {
    router.replace('/home');
  }, 1400);
});
</script>

<template>
  <section class="screen splash-screen">
    <div class="splash-badge">￥</div>
    <h1>好好记账</h1>
    <p>把每一笔都记清楚</p>
    <div class="splash-book">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </section>
</template>

