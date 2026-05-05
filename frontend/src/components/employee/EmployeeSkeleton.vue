<script setup lang="ts">
interface Props {
  type?: 'card' | 'list' | 'row'
  count?: number
}

withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 1,
})
</script>

<template>
  <div class="emp-skeleton-list" role="status" aria-label="Loading...">
    <div
      v-for="i in count"
      :key="i"
      class="emp-skeleton-item"
      :class="`emp-skeleton-item--${type}`"
    >
      <!-- card skeleton -->
      <template v-if="type === 'card'">
        <div class="skeleton-bar skeleton-bar--title" />
        <div class="skeleton-bar skeleton-bar--content" />
        <div class="skeleton-bar skeleton-bar--content skeleton-bar--short" />
      </template>

      <!-- list skeleton -->
      <template v-else-if="type === 'list'">
        <div class="skeleton-dot" />
        <div class="skeleton-lines">
          <div class="skeleton-bar skeleton-bar--text" />
          <div class="skeleton-bar skeleton-bar--text skeleton-bar--short" />
        </div>
        <div class="skeleton-badge" />
      </template>

      <!-- row skeleton -->
      <template v-else-if="type === 'row'">
        <div class="skeleton-bar skeleton-bar--text" />
        <div class="skeleton-bar skeleton-bar--text skeleton-bar--short" />
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.emp-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.emp-skeleton-item {
  background: var(--emp-card, #ffffff);
  border: 1px solid var(--emp-border, #e2e8f0);
  border-radius: var(--emp-radius, 1rem);
  padding: 1.25rem;
}

.emp-skeleton-item--list {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border-radius: var(--emp-radius, 1rem);
}

.emp-skeleton-item--row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 0.875rem 1rem;
}

.skeleton-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--emp-border, #e2e8f0);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-badge {
  width: 52px;
  height: 22px;
  border-radius: 9999px;
  background: var(--emp-border, #e2e8f0);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-bar {
  background: var(--emp-border, #e2e8f0);
  border-radius: 0.375rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-bar--title {
  height: 14px;
  width: 40%;
  margin-bottom: 0.875rem;
}

.skeleton-bar--content {
  height: 10px;
  width: 90%;
  margin-bottom: 0.5rem;
}

.skeleton-bar--text {
  height: 10px;
  width: 100%;
}

.skeleton-bar--short {
  width: 55% !important;
}
</style>
