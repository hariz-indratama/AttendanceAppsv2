<script setup lang="ts">
withDefaults(defineProps<{
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>(), {
  hoverable: false,
  padding: 'md',
})
</script>

<template>
  <div
    :class="[
      'admin-card',
      `admin-card--pad-${padding}`,
      { 'admin-card--hoverable': hoverable },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
/* ─── Card base ───────────────────────────────────────────── */
.admin-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

/* ─── Padding variants ────────────────────────────────────── */
.admin-card--pad-sm {
  padding: 1rem;
}

.admin-card--pad-md {
  padding: 1.5rem;
}

.admin-card--pad-lg {
  padding: 2rem;
}

/* ─── Hoverable ───────────────────────────────────────────── */
.admin-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--accent-admin-border);
}
</style>