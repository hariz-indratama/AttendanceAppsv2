<script setup lang="ts">
type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'
type BadgeSize = 'sm' | 'md'

withDefaults(defineProps<{
  variant?: BadgeVariant
  label: string
  size?: BadgeSize
}>(), {
  variant: 'neutral',
  size: 'md',
})
</script>

<template>
  <span :class="['admin-badge', `admin-badge--${variant}`, `admin-badge--${size}`]">
    <slot name="icon" />
    <span class="admin-badge__label">{{ label }}</span>
  </span>
</template>

<style scoped>
/* ─── Base badge ──────────────────────────────────────────── */
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
  border: 1px solid transparent;
}

/* ─── Sizes ──────────────────────────────────────────────── */
.admin-badge--sm {
  font-size: 0.6875rem;
  padding: 0.2rem 0.6rem;
}

.admin-badge--md {
  font-size: 0.8125rem;
  padding: 0.3125rem 0.75rem;
}

/* ─── Variants ───────────────────────────────────────────── */
.admin-badge--success {
  background: var(--success-muted);
  color: var(--success-text);
  border-color: var(--success-border);
}

.admin-badge--warning {
  background: rgba(245, 158, 11, 0.08);
  color: #92400e;
  border-color: rgba(245, 158, 11, 0.25);
}

.admin-badge--danger {
  background: var(--danger-muted);
  color: var(--danger-text);
  border-color: var(--danger-border);
}

.admin-badge--neutral {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border);
}

/* ─── Icon slot ───────────────────────────────────────────── */
.admin-badge :deep(svg) {
  width: 0.875em;
  height: 0.875em;
  flex-shrink: 0;
}
</style>