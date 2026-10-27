<script setup lang="ts">
import { computed } from 'vue'
import { ASSIGNEES } from '@/api/tasksApi'
import TaskStatusBadge from './TaskStatusBadge.vue'
import type { Task } from '@/types/task'

const props = defineProps<{ task: Task }>()
defineEmits<{ delete: [task: Task] }>()

const assignee = computed(() => ASSIGNEES.find((a) => a.id === props.task.assigneeId)?.name ?? '—')
const deadline = computed(() => new Date(props.task.deadline).toLocaleDateString('ru-RU'))
const overdue = computed(
  () => props.task.status !== 'done' && props.task.deadline < new Date().toISOString().slice(0, 10),
)
</script>

<template>
  <li class="task">
    <div class="task__main">
      <h3 class="task__title">{{ task.title }}</h3>
      <p class="task__desc">{{ task.description }}</p>
      <div class="task__meta">
        <TaskStatusBadge :status="task.status" />
        <span>👤 {{ assignee }}</span>
        <span :class="{ 'task__overdue': overdue }">
          ⏰ {{ deadline }}<template v-if="overdue"> · просрочена</template>
        </span>
      </div>
    </div>
    <div class="task__actions">
      <RouterLink :to="{ name: 'task-edit', params: { id: task.id } }" class="btn">Изменить</RouterLink>
      <button type="button" class="btn btn--danger" @click="$emit('delete', task)">Удалить</button>
    </div>
  </li>
</template>

<style scoped lang="scss">
.task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: $color-surface;
  border-radius: $radius;
  box-shadow: $shadow;

  @include respond-down($breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
  }

  &__title {
    font-size: 16px;
  }

  &__desc {
    margin: 4px 0 10px;
    color: $color-muted;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 16px;
    font-size: 13px;
    color: $color-muted;
  }

  &__overdue {
    color: $color-danger;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}
</style>
