<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';

const store = useAppStore();
const router = useRouter();

function go(path: string) {
  store.closeLoginPrompt();
  router.push(path);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.loginPrompt.open" class="sheet-mask" @click.self="store.closeLoginPrompt">
      <section class="bottom-sheet login-sheet">
        <span class="sheet-handle"></span>
        <div class="lock-illustration">🔒</div>
        <h2>登录后继续</h2>
        <p>登录后可{{ store.loginPrompt.intent }}、同步数据，并使用完整的个性化能力。</p>
        <button class="primary-button" type="button" @click="go('/login')">去登录</button>
        <button class="ghost-button" type="button" @click="go('/register')">注册账号</button>
        <button class="text-button" type="button" @click="store.closeLoginPrompt">先逛逛</button>
      </section>
    </div>
  </Transition>
</template>

