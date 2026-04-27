<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { useAppStore } from '../stores/app';
import type { Tag } from '../types';

const store = useAppStore();
const keyword = ref('');
const selectedId = ref(store.sortedTags[0]?.id ?? '');
const sheetOpen = ref(false);
const editingId = ref('');
const form = reactive({
  name: '',
  color: '#2878ff'
});

const filteredTags = computed(() =>
  store.sortedTags.filter((item) => item.name.toLowerCase().includes(keyword.value.trim().toLowerCase()))
);

const selectedTag = computed(() => filteredTags.value.find((item) => item.id === selectedId.value) ?? null);

watch(
  filteredTags,
  (list) => {
    if (!list.length) {
      selectedId.value = '';
      return;
    }

    if (!list.some((item) => item.id === selectedId.value)) {
      selectedId.value = list[0].id;
    }
  },
  { immediate: true }
);

function openCreate() {
  editingId.value = '';
  Object.assign(form, { name: '', color: '#2878ff' });
  sheetOpen.value = true;
}

function handleCreate() {
  if (!store.requireAuth(undefined, '新建标签')) return;
  openCreate();
}

function openEdit(tag?: Tag | null) {
  if (!tag) return;
  editingId.value = tag.id;
  Object.assign(form, { name: tag.name, color: tag.color });
  sheetOpen.value = true;
}

async function save() {
  if (!form.name.trim()) {
    store.showToast('请输入标签名称');
    return;
  }
  let ok = false;
  if (editingId.value) {
    ok = await store.updateTag(editingId.value, {
      name: form.name.trim(),
      color: form.color
    });
  } else {
    ok = await store.addTag({
      name: form.name.trim(),
      color: form.color
    });
  }
  if (ok) sheetOpen.value = false;
}
</script>

<template>
  <section class="screen">
    <PageHeader title="标签管理" back subtitle="搜索、选择、修改与删除" action-label="新建标签" action-icon="+" @action="handleCreate" />

    <section v-if="!store.isLoggedIn" class="locked-card frosted-card">
      <div class="lock-illustration large">🏷</div>
      <h2>标签管理需要登录</h2>
      <p>登录后可以新增、修改和删除标签，并在记一笔中快速引用。</p>
      <button class="primary-button" type="button" @click="store.requireAuth(undefined, '管理标签')">去登录</button>
    </section>

    <template v-else>
      <section class="search-panel frosted-card">
        <input v-model="keyword" placeholder="搜索标签" />
        <div class="search-hint">
          <span>点击标签可选择并操作</span>
          <strong>共 {{ filteredTags.length }} 个标签</strong>
        </div>
      </section>

      <section class="list-card">
        <div class="tag-manager-grid">
          <button
            v-for="tag in filteredTags"
            :key="tag.id"
            class="tag-manager-item"
            :class="{ active: selectedId === tag.id }"
            :style="{ '--tag-color': tag.color }"
            type="button"
            @click="selectedId = tag.id"
          >
            <span class="tag-dot"></span>
            <strong>{{ tag.name }}</strong>
            <small>×</small>
          </button>
        </div>
      </section>

      <section class="action-strip">
        <span>已选中 {{ selectedTag ? 1 : 0 }} 个标签</span>
        <button class="ghost-button" type="button" @click="openEdit(selectedTag)">修改标签</button>
        <button class="ghost-button danger" type="button" @click="selectedTag && store.deleteTag(selectedTag.id)">删除标签</button>
      </section>

      <section class="frosted-card tips-card">
        <div>
          <h2>使用提示</h2>
          <p>点击标签右侧“×”可作为删除入口的视觉提示，演示版中统一在底部操作区执行删除。</p>
          <p>长按拖动排序可在后续接入真实拖拽方案时扩展。</p>
        </div>
        <div class="tips-tag">⌁</div>
      </section>

      <Transition name="fade">
        <div v-if="sheetOpen" class="sheet-mask" @click.self="sheetOpen = false">
          <section class="bottom-sheet form-sheet">
            <span class="sheet-handle"></span>
            <h2>{{ editingId ? '修改标签' : '新建标签' }}</h2>
            <div class="form-grid">
              <label class="full-width">
                <span>标签名称</span>
                <input v-model="form.name" maxlength="10" placeholder="比如：通勤" />
              </label>
              <label>
                <span>颜色</span>
                <input v-model="form.color" type="color" />
              </label>
              <div class="tag-preview">
                <span class="tag-pill active" :style="{ '--tag-color': form.color }">{{ form.name || '标签预览' }}</span>
              </div>
            </div>
            <div class="sheet-actions">
              <button class="ghost-button" type="button" @click="sheetOpen = false">取消</button>
              <button class="primary-button" type="button" @click="save">保存</button>
            </div>
          </section>
        </div>
      </Transition>
    </template>
  </section>
</template>
