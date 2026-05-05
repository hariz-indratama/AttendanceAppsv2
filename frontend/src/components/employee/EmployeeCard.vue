<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
})
</script>

<template>
  <div
    class="emp-card"
    :class="[
      `emp-card--padding-${padding}`,
      { 'emp-card--hoverable': hoverable },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.emp-card {
  background: var(--emp-card, #ffffff);
  border: 1px solid var(--emp-border, #e2e8f0);
  border-radius: var(--emp-radius, 1rem);
  box-shadow: var(--emp-shadow, 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04));
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.emp-card--padding-sm {
  padding: 0.75rem;
}

.emp-card--padding-md {
  padding: 1.25rem;
}

.emp-card--padding-lg {
  padding: 2rem;
}

.emp-card--hoverable {
  cursor: pointer;
}

.emp-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--emp-shadow-lg, 0 4px 16px rgba(0, 0, 0, 0.08));
  border-color: var(--emp-accent, #6366f1);
}
</style>
