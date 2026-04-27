<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../components/PageHeader.vue';
import { useAppStore } from '../stores/app';
import { formatMoney } from '../utils/format';

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const transaction = computed(() => store.transactions.find((item) => item.id === route.params.id));
const category = computed(() => (transaction.value ? store.getCategory(transaction.value.categoryId) : null));
const tags = computed(() =>
  transaction.value ? store.sortedTags.filter((item) => transaction.value?.tagIds.includes(item.id)) : []
);
</script>

<template>
  <section class="screen">
    <PageHeader title="账单详情" back subtitle="查看这笔记录的完整信息" />
    <section v-if="transaction && category" class="list-card detail-card">
      <span class="detail-icon" :style="{ color: category.color, backgroundColor: `${category.color}18` }">{{ category.icon }}</span>
      <strong class="detail-amount">{{ formatMoney(transaction.amount) }}</strong>
      <p>{{ transaction.type === 'income' ? '收入' : '支出' }} · {{ category.name }}</p>
      <div class="detail-grid">
        <div>
          <small>日期时间</small>
          <strong>{{ new Date(transaction.occurredAt).toLocaleString('zh-CN') }}</strong>
        </div>
        <div>
          <small>支付方式</small>
          <strong>{{ transaction.paymentMethod }}</strong>
        </div>
        <div>
          <small>备注</small>
          <strong>{{ transaction.note || '未填写备注' }}</strong>
        </div>
        <div>
          <small>标签</small>
          <strong>{{ tags.length ? tags.map((item) => item.name).join(' / ') : '无标签' }}</strong>
        </div>
      </div>
      <button class="ghost-button" type="button" @click="router.back()">返回上一页</button>
    </section>
    <section v-else class="empty-block">
      <strong>没有找到这笔账单</strong>
      <p>它可能已被删除，或者当前示例数据尚未同步。</p>
    </section>
  </section>
</template>

