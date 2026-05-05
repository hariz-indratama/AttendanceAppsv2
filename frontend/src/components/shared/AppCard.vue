<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  variant?: 'default' | 'admin' | 'employee'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  variant: 'default',
  shadow: 'default',
})
</script>

<template>
  <div
    :class="[
      'app-card',
      `app-card--padding-${padding}`,
      `app-card--variant-${variant}`,
      `app-card--shadow-${shadow}`,
      { 'app-card--hoverable': hoverable }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

/* ─── Padding variants ───────────────────────────────────── */
.app-card--padding-none { padding: 0; }
.app-card--padding-sm { padding: 0.75rem; }
.app-card--padding-md { padding: 1.25rem; }
.app-card--padding-lg { padding: 1.75rem; }

/* ─── Shadow variants ─────────────────────────────────────── */
.app-card--shadow-none { box-shadow: none; }
.app-card--shadow-sm { box-shadow: var(--shadow-sm); }
.app-card--shadow-default { box-shadow: var(--shadow-card); }
.app-card--shadow-lg { box-shadow: var(--shadow-lg); }

/* ─── Theme variants ─────────────────────────────────────── */
.app-card--variant-admin {
  background: var(--admin-card, var(--bg-card));
  border-color: var(--admin-border, var(--border));
}

.app-card--variant-employee {
  background: var(--bg-card);
  border-color: var(--border);
}

/* ─── Hoverable ───────────────────────────────────────────── */
.app-card--hoverable {
  cursor: pointer;
}

.app-card--hoverable:hover {
  transform: translateY(-2px);
}

.app-card--variant-admin.app-card--hoverable:hover {
  border-color: var(--accent-admin-border);
  box-shadow: var(--shadow-md);
}

.app-card--variant-employee.app-card--hoverable:hover,
.app-card--variant-default.app-card--hoverable:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow-card-hover);
}
</style>