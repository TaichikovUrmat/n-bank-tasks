<script setup lang="ts">
import { STATUS_LABELS, type TaskStatus } from '@/types/task'

defineProps<{ status: TaskStatus }>()
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ STATUS_LABELS[status] }}</span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border-radius: 999px;

  &--todo {
    color: $color-muted;
    background: rgba($color-muted, 0.14);
  }

  &--in_progress {
    color: $color-warning;
    background: rgba($color-warning, 0.14);
  }

  &--done {
    color: $color-success;
    background: rgba($color-success, 0.14);
  }
}
</style>
