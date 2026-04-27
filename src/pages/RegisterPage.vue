<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';

const router = useRouter();
const store = useAppStore();

const form = reactive({
  account: '',
  password: '',
  confirmPassword: '',
  agreed: false
});

async function submit() {
  const ok = await store.register(form.account, form.password, form.confirmPassword, form.agreed);
  if (ok) router.replace('/home');
}
</script>

<template>
  <section class="screen auth-screen">
    <header class="auth-header">
      <button class="icon-button" type="button" @click="$router.back()">‹</button>
      <span>帮助</span>
    </header>
    <div class="auth-hero register-hero">
      <div>
        <h1>注册账号</h1>
        <p>注册后即可开启完整记账体验</p>
      </div>
    </div>
    <section class="auth-card">
      <label>
        <span>手机号或邮箱</span>
        <input v-model="form.account" placeholder="请输入账号" />
      </label>
      <label>
        <span>设置密码</span>
        <input v-model="form.password" type="password" placeholder="至少 6 位" />
      </label>
      <label>
        <span>确认密码</span>
        <input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" />
      </label>
      <button class="check-button agreement" type="button" @click="form.agreed = !form.agreed">
        {{ form.agreed ? '●' : '○' }} 我已阅读并同意《用户协议》和《隐私政策》
      </button>
      <button class="primary-button" type="button" @click="submit">注册并开始记账</button>
      <p class="auth-foot">
        已有账号？
        <button class="link-button inline" type="button" @click="$router.push('/login')">去登录</button>
      </p>
    </section>
  </section>
</template>
