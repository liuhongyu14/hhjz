import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/splash'
  },
  {
    path: '/splash',
    name: 'splash',
    component: () => import('../pages/SplashPage.vue'),
    meta: { immersive: true }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: { tab: 'home', showTab: true }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../pages/CalendarPage.vue'),
    meta: { tab: 'calendar', showTab: true }
  },
  {
    path: '/entry',
    name: 'entry',
    component: () => import('../pages/EntryPage.vue'),
    meta: { tab: 'entry', showTab: true }
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../pages/StatsPage.vue'),
    meta: { tab: 'stats', showTab: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { tab: 'profile', showTab: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/RegisterPage.vue')
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../pages/CategoriesPage.vue'),
    meta: { tab: 'profile', showTab: true }
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../pages/TagsPage.vue'),
    meta: { tab: 'profile', showTab: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../pages/AboutPage.vue')
  },
  {
    path: '/transactions/:id',
    name: 'transaction-detail',
    component: () => import('../pages/TransactionDetailPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;

