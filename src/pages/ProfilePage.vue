<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { colorPalette, grid, informationCircle, logInOutline, pricetag, settingsOutline } from 'ionicons/icons';
import { useAppStore } from '../stores/app';

const store = useAppStore();
</script>

<template>
  <section class="screen">
    <header class="profile-title">
      <h1>我的</h1>
      <button class="icon-button gear-button" type="button" @click="store.openThemeSheet">
        <IonIcon :icon="settingsOutline" />
      </button>
    </header>

    <section class="profile-card frosted-card">
      <div class="avatar-badge">{{ store.user?.avatar ?? '🙂' }}</div>
      <div class="profile-copy">
        <h2>{{ store.user?.account ?? '游客模式' }}</h2>
        <p>{{ store.user ? '把每一笔都记清楚' : '可浏览演示数据，写操作需登录后继续' }}</p>
      </div>
      <button class="link-button" type="button" @click="store.isLoggedIn ? store.logout() : $router.push('/login')">
        <span>{{ store.isLoggedIn ? '退出' : '登录' }}</span>
        <IonIcon :icon="logInOutline" />
      </button>
    </section>

    <section class="menu-card">
      <button class="menu-row" type="button" @click="store.requireAuth(() => $router.push('/categories'), '管理分类')">
        <span class="menu-icon blue"><IonIcon :icon="grid" /></span>
        <strong>账本分类</strong>
        <span>›</span>
      </button>
      <button class="menu-row" type="button" @click="store.requireAuth(() => $router.push('/tags'), '管理标签')">
        <span class="menu-icon purple"><IonIcon :icon="pricetag" /></span>
        <strong>标签管理</strong>
        <span>›</span>
      </button>
      <button class="menu-row" type="button" @click="store.openThemeSheet()">
        <span class="menu-icon green"><IonIcon :icon="colorPalette" /></span>
        <strong>切换主题</strong>
        <small>{{ store.themeLabel }}</small>
        <span>›</span>
      </button>
      <button class="menu-row" type="button" @click="$router.push('/about')">
        <span class="menu-icon indigo"><IonIcon :icon="informationCircle" /></span>
        <strong>关于我们</strong>
        <span>›</span>
      </button>
    </section>
  </section>
</template>
