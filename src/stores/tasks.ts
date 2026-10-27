import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/api/tasksApi'
import type { Task, TaskFilters } from '@/types/task'

export const PAGE_SIZE = 8

const emptyFilters = (): TaskFilters => ({ status: '', search: '', assigneeId: null })

export const useTasksStore = defineStore('tasks', () => {
  const items = ref<Task[]>([])
  const total = ref(0)
  const page = ref(1)
  const filters = ref<TaskFilters>(emptyFilters())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Защита от гонок: учитываем только ответ на последний запрос.
  let requestId = 0

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

  async function load(): Promise<void> {
    const current = ++requestId
    loading.value = true
    error.value = null
    try {
      const result = await api.fetchTasks(filters.value, page.value, PAGE_SIZE)
      if (current !== requestId) return
      items.value = result.items
      total.value = result.total
      // страница могла опустеть (например, после удаления последней задачи)
      if (result.items.length === 0 && page.value > 1) {
        page.value = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
        await load()
      }
    } catch (e) {
      if (current !== requestId) return
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить задачи'
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  function setQuery(next: TaskFilters, nextPage: number): Promise<void> {
    filters.value = { ...next }
    page.value = nextPage
    return load()
  }

  async function remove(id: number): Promise<void> {
    await api.deleteTask(id)
    await load()
  }

  return { items, total, page, filters, loading, error, pageCount, load, setQuery, remove }
})
