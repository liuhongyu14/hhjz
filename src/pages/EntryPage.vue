<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../components/PageHeader.vue';
import { demoToday } from '../data/demo';
import { useAppStore } from '../stores/app';
import type { TransactionType } from '../types';

const store = useAppStore();
const router = useRouter();

const form = reactive({
  type: 'expense' as TransactionType,
  amount: '',
  categoryId: 'food',
  occurredAt: demoToday,
  paymentMethod: '支付宝',
  note: '',
  tagIds: [] as string[]
});

const categories = computed(() =>
  store.sortedCategories.filter((item) => item.type === 'both' || item.type === form.type)
);

const selectedTagIds = computed(() => new Set(form.tagIds));

watch(
  categories,
  (list) => {
    if (!list.some((item) => item.id === form.categoryId)) {
      form.categoryId = list[0]?.id ?? '';
    }
  },
  { immediate: true }
);

function toggleTag(id: string) {
  if (selectedTagIds.value.has(id)) {
    form.tagIds = form.tagIds.filter((item) => item !== id);
  } else {
    form.tagIds = [...form.tagIds, id];
  }
}

function setType(nextType: TransactionType) {
  form.type = nextType;
  form.categoryId = categories.value[0]?.id ?? '';
}

async function save() {
  if (!store.requireAuth(undefined, '保存账单')) return;
  const amount = Number(form.amount);
  if (!amount || amount <= 0 || !form.categoryId) {
    store.showToast('请先填写金额并选择分类');
    return;
  }
  const ok = await store.addTransaction({
    type: form.type,
    amount,
    categoryId: form.categoryId,
    occurredAt: form.occurredAt,
    paymentMethod: form.paymentMethod,
    note: form.note.trim(),
    tagIds: form.tagIds
  });
  if (ok) router.push('/home');
}
</script>

<template>
  <section class="screen">
    <PageHeader title="记一笔" subtitle="用最少步骤完成一笔账单录入" />

    <section v-if="!store.isLoggedIn" class="locked-card frosted-card">
      <div class="lock-illustration large">🔐</div>
      <h2>游客可浏览，写入前需要登录</h2>
      <p>登录后即可新增账单、同步数据、切换主题与管理分类标签。</p>
      <button class="primary-button" type="button" @click="store.requireAuth(undefined, '记一笔')">去登录</button>
    </section>

    <template v-else>
      <section class="segmented-control">
        <button :class="{ active: form.type === 'expense' }" type="button" @click="setType('expense')">支出</button>
        <button :class="{ active: form.type === 'income' }" type="button" @click="setType('income')">收入</button>
      </section>

      <section class="entry-card">
        <label>
          <span>金额</span>
          <input v-model="form.amount" inputmode="decimal" placeholder="0.00" />
        </label>
        <label>
          <span>日期</span>
          <input v-model="form.occurredAt" type="date" />
        </label>
        <label>
          <span>支付方式</span>
          <select v-model="form.paymentMethod">
            <option>支付宝</option>
            <option>微信支付</option>
            <option>银行卡</option>
            <option>现金</option>
            <option>交通卡</option>
            <option>医保卡</option>
          </select>
        </label>
        <label>
          <span>备注</span>
          <input v-model="form.note" maxlength="24" placeholder="这笔钱花在了哪里？" />
        </label>
      </section>

      <section class="list-card">
        <div class="section-title">
          <h2>选择分类</h2>
        </div>
        <div class="category-grid">
          <button
            v-for="item in categories"
            :key="item.id"
            class="category-card"
            :class="{ active: form.categoryId === item.id }"
            type="button"
            @click="form.categoryId = item.id"
          >
            <span class="category-chip" :style="{ color: item.color, backgroundColor: `${item.color}18` }">{{ item.icon }}</span>
            <strong>{{ item.name }}</strong>
            <small>{{ item.description }}</small>
          </button>
        </div>
      </section>

      <section class="list-card">
        <div class="section-title">
          <h2>标签</h2>
          <button class="link-button" type="button" @click="$router.push('/tags')">管理</button>
        </div>
        <div class="tag-cloud">
          <button
            v-for="tag in store.sortedTags.slice(0, 10)"
            :key="tag.id"
            class="tag-pill"
            :class="{ active: selectedTagIds.has(tag.id) }"
            :style="{ '--tag-color': tag.color }"
            type="button"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>
      </section>

      <button class="primary-button sticky-save" type="button" @click="save">保存</button>
    </template>
  </section>
</template>
