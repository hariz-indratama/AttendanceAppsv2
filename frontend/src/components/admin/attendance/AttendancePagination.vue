<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  lastPage: number
  totalRecords: number
  displayedCount: number
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <div
    v-if="displayedCount > 0"
    class="px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    style="border-color: var(--admin-border);"
  >
    <p class="text-xs" style="color: var(--admin-text-secondary);">
      Showing {{ displayedCount }} of {{ totalRecords }} records
      <span v-if="lastPage > 1" class="ml-1"> &mdash; Page {{ currentPage }} of {{ lastPage }}</span>
    </p>
    <div class="flex gap-2">
      <button
        :disabled="currentPage <= 1"
        @click="emit('prev')"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
        style="border: 1px solid var(--admin-border); color: var(--admin-text-secondary);"
      >
        Prev
      </button>
      <button
        :disabled="currentPage >= lastPage"
        @click="emit('next')"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
        style="border: 1px solid var(--admin-border); color: var(--admin-text-secondary);"
      >
        Next
      </button>
    </div>
  </div>
</template>
