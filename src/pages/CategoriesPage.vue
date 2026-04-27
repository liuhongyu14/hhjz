<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { useAppStore } from '../stores/app';
import type { Category } from '../types';

const store = useAppStore();

const sheetOpen = ref(false);
const editingId = ref('');
const form = reactive({
  name: '',
  icon: '🗂',
  color: '#2878ff',
  description: '',
  type: 'expense' as Category['type']
});

const editing = computed(() => store.sortedCategories.find((item) => item.id === editingId.value) ?? null);

function openCreate() {
  editingId.value = '';
  Object.assign(form, {
    name: '',
    icon: '🗂',
    color: '#2878ff',
    description: '',
    type: 'expense'
  });
  sheetOpen.value = true;
}

function handleCreate() {
  if (!store.requireAuth(undefined, '新建分类')) return;
  openCreate();
}

function openEdit(category: Category) {
  editingId.value = category.id;
  Object.assign(form, {
    name: category.name,
    icon: category.icon,
    color: category.color,
    description: category.description,
    type: category.type
  });
  sheetOpen.value = true;
}

async function save() {
  if (!form.name.trim()) {
    store.showToast('请先填写分类名称');
    return;
  }
  let ok = false;
  if (editing.value) {
    ok = await store.updateCategory(editing.value.id, {
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      description: form.description.trim(),
      type: form.type
    });
  } else {
    ok = await store.addCategory({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      description: form.description.trim(),
      type: form.type
    });
  }
  if (ok) sheetOpen.value = false;
}
</script>

<template>
  <section class="screen">
    <PageHeader title="账本分类管理" back subtitle="新增、编辑、删除与排序" action-label="新建分类" action-icon="+" @action="handleCreate" />

    <section v-if="!store.isLoggedIn" class="locked-card frosted-card">
      <div class="lock-illustration large">🗂</div>
      <h2>登录后才能管理分类</h2>
      <p>游客可继续浏览首页、日历和统计页，分类管理属于写操作，登录后继续。</p>
      <button class="primary-button" type="button" @click="store.requireAuth(undefined, '管理分类')">去登录</button>
    </section>

    <section v-else class="stack-list">
      <article v-for="item in store.sortedCategories" :key="item.id" class="manager-card">
        <div class="manager-main">
          <span class="category-chip large" :style="{ color: item.color, backgroundColor: `${item.color}18` }">{{ item.icon }}</span>
          <div>
            <strong>{{ item.name }}</strong>
            <p>{{ item.description || '还没有补充描述' }}</p>
            <small>{{ item.type === 'income' ? '收入分类' : '支出分类' }}</small>
          </div>
        </div>
        <div class="manager-actions">
          <button class="small-button" type="button" @click="store.moveCategory(item.id, 'up')">上移</button>
          <button class="small-button" type="button" @click="store.moveCategory(item.id, 'down')">下移</button>
          <button class="small-button" type="button" @click="openEdit(item)">编辑</button>
          <button class="small-button danger" type="button" @click="store.deleteCategory(item.id)">删除</button>
        </div>
      </article>
    </section>

    <Transition v-if="store.isLoggedIn" name="fade">
      <div v-if="sheetOpen" class="sheet-mask" @click.self="sheetOpen = false">
        <section class="bottom-sheet form-sheet">
          <span class="sheet-handle"></span>
          <h2>{{ editing ? '编辑账本分类' : '新建账本分类' }}</h2>
          <div class="form-grid">
            <label>
              <span>分类名称</span>
              <input v-model="form.name" maxlength="10" placeholder="比如：住房" />
            </label>
            <label>
              <span>图标</span>
              <input v-model="form.icon" maxlength="2" />
            </label>
            <label>
              <span>高亮颜色</span>
              <input v-model="form.color" type="color" />
            </label>
            <label>
              <span>分类类型</span>
              <select v-model="form.type">
                <option value="expense">支出</option>
                <option value="income">收入</option>
                <option value="both">通用</option>
              </select>
            </label>
            <label class="full-width">
              <span>描述</span>
              <textarea v-model="form.description" rows="3" maxlength="24" placeholder="描述这个分类常用于哪些场景"></textarea>
            </label>
          </div>
          <div class="sheet-actions">
            <button class="ghost-button" type="button" @click="sheetOpen = false">取消</button>
            <button class="primary-button" type="button" @click="save">保存</button>
          </div>
        </section>
      </div>
    </Transition>
  </section>
</template>
