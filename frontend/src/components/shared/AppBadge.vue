<script setup lang="ts">
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  pill?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  pill: true,
})
</script>

<template>
  <span
    :class="[
      'app-badge',
      `app-badge--${variant}`,
      `app-badge--${size}`,
      { 'app-badge--pill': pill }
    ]"
  >
    <slot name="icon" />
    <span v-if="$slots.default" class="app-badge__label">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-body);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
  border: 1px solid transparent;
  transition: background-color 150ms, color 150ms, border-color 150ms;
}

.app-badge--pill {
  border-radius: var(--radius-full);
}

/* ─── Sizes ──────────────────────────────────────────────── */
.app-badge--sm {
  font-size: 0.625rem;
  padding: 0.1875rem 0.5rem;
}

.app-badge--md {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
}

.app-badge--lg {
  font-size: 0.875rem;
  padding: 0.375rem 0.875rem;
}

/* ─── Variants ───────────────────────────────────────────── */
.app-badge--success {
  background: var(--success-muted);
  color: var(--success-text);
  border-color: var(--success-border);
}

.app-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.2);
}

.app-badge--danger {
  background: var(--danger-muted);
  color: var(--danger-text);
  border-color: var(--danger-border);
}

.app-badge--neutral {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border);
}

.app-badge--info {
  background: var(--accent-muted);
  color: var(--accent);
  border-color: var(--accent-border);
}

/* ─── Icon slot ───────────────────────────────────────────── */
.app-badge :deep(svg) {
  width: 0.875em;
  height: 0.875em;
  flex-shrink: 0;
}
</style>