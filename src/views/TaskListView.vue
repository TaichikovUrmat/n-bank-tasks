<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppPagination from '@/components/AppPagination.vue'
import TaskFilters from '@/components/TaskFilters.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskFilters as Filters, TaskStatus } from '@/types/task'

const route = useRoute()
const router = useRouter()
const store = useTasksStore()
const { items, total, loading, error, pageCount } = storeToRefs(store)

const first = (v: LocationQuery[string]) => (Array.isArray(v) ? v[0] : v) ?? ''

// Источник истины — URL: фильтры и страница переживают перезагрузку и работают с back/forward.
const filters = computed<Filters>(() => {
  const assignee = Number(first(route.query.assignee))
  return {
    status: first(route.query.status) as TaskStatus | '',
    search: first(route.query.q),
    assigneeId: Number.isInteger(assignee) && assignee > 0 ? assignee : null,
  }
})
const page = computed(() => Math.max(1, Number(first(route.query.page)) || 1))

watch(
  [filters, page],
  ([f, p]) => {
    // при уходе на другой маршрут query меняется ещё до размонтирования — не грузим лишнего
    if (route.name === 'tasks') store.setQuery(f, p)
  },
  { immediate: true },
)

function pushQuery(f: Filters, p: number) {
  router.push({
    query: {
      q: f.search || undefined,
      status: f.status || undefined,
      assignee: f.assigneeId ?? undefined,
      page: p > 1 ? p : undefined,
    },
  })
}

// при смене фильтра всегда возвращаемся на первую страницу
const onFilters = (f: Filters) => pushQuery(f, 1)
const onPage = (p: number) => pushQuery(filters.value, p)

async function onDelete(task: Task) {
  if (!confirm(`Удалить задачу «${task.title}»?`)) return
  await store.remove(task.id)
}
</script>

<template>
  <section>
    <div class="head">
      <h1>Задачи</h1>
      <span class="head__total">Всего: {{ total }}</span>
    </div>

    <TaskFilters :model-value="filters" @update:model-value="onFilters" />

    <p v-if="error" class="state state--error">
      {{ error }} <button class="btn" @click="store.load()">Повторить</button>
    </p>

    <div class="list" :class="{ 'list--loading': loading }" :aria-busy="loading">
      <ul v-if="items.length" class="list__items">
        <TaskItem v-for="task in items" :key="task.id" :task="task" @delete="onDelete" />
      </ul>
      <p v-else-if="!loading && !error" class="state">Задачи не найдены</p>
    </div>

    <AppPagination :page="store.page" :page-count="pageCount" @change="onPage" />
  </section>
</template>

<style scoped lang="scss">
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;

  &__total {
    color: $color-muted;
  }
}

.list {
  min-height: 120px;
  transition: opacity 0.15s;

  &--loading {
    opacity: 0.5;
    pointer-events: none;
  }

  &__items {
    display: grid;
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
  }
}

.state {
  padding: 32px 0;
  text-align: center;
  color: $color-muted;

  &--error {
    color: $color-danger;
  }
}
</style>
