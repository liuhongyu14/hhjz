<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import type { Transaction } from '../types';
import { formatSignedMoney, formatTime } from '../utils/format';

const props = defineProps<{
  transaction: Transaction;
}>();

const store = useAppStore();
const router = useRouter();

const category = computed(() => store.getCategory(props.transaction.categoryId));
</script>

<template>
  <button class="transaction-item" type="button" @click="router.push(`/transactions/${transaction.id}`)">
    <span class="category-icon" :style="{ color: category.color, backgroundColor: `${category.color}18` }">
      {{ category.icon }}
    </span>
    <span class="transaction-main">
      <strong>{{ transaction.note || category.name }}</strong>
      <small>{{ category.name }}</small>
    </span>
    <span class="transaction-meta">
      <strong :class="{ income: transaction.type === 'income' }">{{ formatSignedMoney(transaction) }}</strong>
      <small>{{ formatTime(transaction.occurredAt) }}</small>
    </span>
  </button>
</template>

