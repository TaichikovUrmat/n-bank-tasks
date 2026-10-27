<script setup lang="ts">
import { ref, watch } from 'vue'
import { ASSIGNEES } from '@/api/tasksApi'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { STATUS_OPTIONS, type TaskFilters } from '@/types/task'

const props = defineProps<{ modelValue: TaskFilters }>()
const emit = defineEmits<{ 'update:modelValue': [value: TaskFilters] }>()

// Поиск вводится мгновенно, но наружу уходит с debounce, чтобы не дёргать API на каждую букву.
const searchInput = ref(props.modelValue.search)
const debouncedSearch = useDebouncedRef(searchInput, 300)

watch(debouncedSearch, (search) => {
  if (search !== props.modelValue.search) emit('update:modelValue', { ...props.modelValue, search })
})

// Внешнее изменение (back/forward, сброс) синхронизируем во внутреннее поле.
watch(
  () => props.modelValue.search,
  (search) => {
    if (search !== searchInput.value) {
      searchInput.value = search
      debouncedSearch.value = search
    }
  },
)

function patch(part: Partial<TaskFilters>) {
  emit('update:modelValue', { ...props.modelValue, ...part })
}

function onAssignee(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  patch({ assigneeId: value === '' ? null : Number(value) })
}

function reset() {
  searchInput.value = ''
  debouncedSearch.value = ''
  emit('update:modelValue', { status: '', search: '', assigneeId: null })
}

const isDirty = () =>
  !!(props.modelValue.status || props.modelValue.search || props.modelValue.assigneeId !== null)
</script>

<template>
  <form class="filters" role="search" @submit.prevent>
    <label class="field filters__search">
      <span class="field__label">Поиск</span>
      <input v-model="searchInput" class="control" type="search" placeholder="Название или описание" />
    </label>

    <label class="field">
      <span class="field__label">Статус</span>
      <select
        class="control"
        :value="modelValue.status"
        @change="patch({ status: ($event.target as HTMLSelectElement).value as TaskFilters['status'] })"
      >
        <option value="">Все</option>
        <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </label>

    <label class="field">
      <span class="field__label">Исполнитель</span>
      <select class="control" :value="modelValue.assigneeId ?? ''" @change="onAssignee">
        <option value="">Все</option>
        <option v-for="a in ASSIGNEES" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
    </label>

    <button type="button" class="btn" :disabled="!isDirty()" @click="reset">Сбросить</button>
  </form>
</template>

<style scoped lang="scss">
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: end;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: $color-surface;
  border-radius: $radius;
  box-shadow: $shadow;

  @include respond-down($breakpoint-md) {
    grid-template-columns: 1fr;
  }
}
</style>
