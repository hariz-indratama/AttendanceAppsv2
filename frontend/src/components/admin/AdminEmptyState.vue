<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
})
</script>

<template>
  <div class="admin-empty">
    <!-- Icon container -->
    <div class="admin-empty__icon-wrap" aria-hidden="true">
      <svg
        class="admin-empty__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path :d="icon" />
      </svg>
    </div>

    <!-- Text -->
    <h3 class="admin-empty__title">{{ title }}</h3>
    <p v-if="description" class="admin-empty__description">{{ description }}</p>

    <!-- Optional CTA slot -->
    <div v-if="$slots.default" class="admin-empty__cta">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  gap: 0.75rem;
}

/* ─── Icon ────────────────────────────────────────────────── */
.admin-empty__icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.admin-empty__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--text-muted);
}

/* ─── Text ────────────────────────────────────────────────── */
.admin-empty__title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
}

.admin-empty__description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 28rem;
  margin: 0;
}

/* ─── CTA slot ───────────────────────────────────────────── */
.admin-empty__cta {
  margin-top: 0.75rem;
}
</style>