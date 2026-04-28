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
    <div class="splash-orb splash-orb-one"></div>
    <div class="splash-orb splash-orb-two"></div>

    <div class="splash-content">
      <div class="splash-logo-wrap">
        <div class="splash-badge">
          <span>￥</span>
        </div>
        <i></i>
      </div>

      <div class="splash-copy">
        <span class="splash-eyebrow">HAOHAO LEDGER</span>
        <h1>好好记账</h1>
        <p>把每一笔都记清楚</p>
      </div>

      <div class="splash-book" aria-hidden="true">
        <div class="splash-book-head">
          <span>今日账单</span>
          <strong>￥128.50</strong>
        </div>
        <div class="splash-book-line long"></div>
        <div class="splash-book-line"></div>
        <div class="splash-book-row">
          <span></span>
          <i></i>
        </div>
        <div class="splash-book-row muted">
          <span></span>
          <i></i>
        </div>
      </div>

      <div class="splash-loading" aria-label="正在加载">
        <span>正在整理账本</span>
        <div class="splash-progress">
          <i></i>
        </div>
      </div>
    </div>
  </section>
</template>
