<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';

const router = useRouter();
const store = useAppStore();

const form = reactive({
  account: '',
  password: '',
  remember: true
});

async function submit() {
  const ok = await store.login(form.account, form.password);
  if (ok) router.replace('/home');
}
</script>

<template>
  <section class="screen auth-screen">
    <header class="auth-header">
      <button class="icon-button" type="button" @click="$router.back()">×</button>
      <span>帮助</span>
    </header>
    <div class="auth-hero">
      <div>
        <h1>登录好好记账</h1>
        <p>欢迎回来，继续记录你的生活</p>
      </div>
      <div class="auth-illustration"></div>
    </div>
    <section class="auth-card">
      <label>
        <span>手机号或邮箱</span>
        <input v-model="form.account" placeholder="请输入账号" />
      </label>
      <label>
        <span>密码</span>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </label>
      <div class="auth-row">
        <button class="check-button" type="button" @click="form.remember = !form.remember">
          {{ form.remember ? '●' : '○' }} 记住我
        </button>
        <button class="link-button" type="button">忘记密码？</button>
      </div>
      <button class="primary-button" type="button" @click="submit">登录</button>
      <div class="auth-divider">其他登录方式已移除</div>
      <p class="auth-foot">
        没有账号？
        <button class="link-button inline" type="button" @click="$router.push('/register')">去注册</button>
      </p>
    </section>
  </section>
</template>
