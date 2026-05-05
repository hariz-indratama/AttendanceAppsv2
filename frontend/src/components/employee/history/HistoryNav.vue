<script setup lang="ts">
defineProps<{
  monthLabel: string
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()
</script>

<template>
  <div class="month-nav">
    <button @click="emit('prev')" class="nav-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="month-label">{{ monthLabel }}</span>
    <button @click="emit('next')" class="nav-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.nav-btn {
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  padding: 0;
}

.nav-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.nav-btn:hover {
  background: var(--bg-card-alt);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.month-label {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
