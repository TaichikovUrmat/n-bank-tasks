<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; pageCount: number }>()
const emit = defineEmits<{ change: [page: number] }>()

// 1 … 4 5 [6] 7 8 … 20
const pages = computed<(number | '…')[]>(() => {
  const { page, pageCount } = props
  const set = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...set].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
})
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination" aria-label="Пагинация">
    <button class="btn" :disabled="page <= 1" @click="emit('change', page - 1)">←</button>
    <template v-for="(p, i) in pages" :key="`${p}-${i}`">
      <span v-if="p === '…'" class="pagination__gap">…</span>
      <button
        v-else
        class="btn"
        :class="{ 'btn--primary': p === page }"
        :aria-current="p === page ? 'page' : undefined"
        @click="emit('change', p)"
      >
        {{ p }}
      </button>
    </template>
    <button class="btn" :disabled="page >= pageCount" @click="emit('change', page + 1)">→</button>
  </nav>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;

  &__gap {
    align-self: center;
    padding: 0 4px;
    color: $color-muted;
  }
}
</style>
