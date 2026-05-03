<script setup lang="ts">
withDefaults(defineProps<{
  caption?: string
  loading?: boolean
}>(), {
  loading: false,
})

const skeletonRows = Array.from({ length: 5 })
</script>

<template>
  <div class="admin-table-wrap">
    <table class="admin-table" aria-label="caption ? caption : undefined">
      <caption v-if="caption" class="admin-table__caption">{{ caption }}</caption>

      <!-- Header slot -->
      <thead v-if="$slots.header" class="admin-table__head">
        <tr>
          <slot name="header" />
        </tr>
      </thead>

      <!-- Body -->
      <tbody class="admin-table__body">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <tr v-for="(_, i) in skeletonRows" :key="i" class="admin-table__skeleton-row">
            <td>
              <div class="admin-table__skeleton-cell"></div>
            </td>
          </tr>
        </template>

        <!-- Default slot rows -->
        <template v-else>
          <slot />
        </template>
      </tbody>
    </table>

    <!-- Loading overlay (optional — shows after table) -->
    <div v-if="loading" class="admin-table__loading-label" aria-live="polite" aria-busy="true">
      Loading…
    </div>
  </div>
</template>

<style scoped>
/* ─── Wrapper — horizontal scroll on mobile ─────────────── */
.admin-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

/* ─── Table ───────────────────────────────────────────────── */
.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
}

/* ─── Caption ────────────────────────────────────────────── */
.admin-table__caption {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: left;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--border);
  caption-side: top;
}

/* ─── Header ─────────────────────────────────────────────── */
.admin-table__head {
  background: var(--bg-secondary);
}

.admin-table__head :slotted(th) {
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* Use :deep for slotted th since we're inside thead */
.admin-table__head :deep(th) {
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ─── Body rows ───────────────────────────────────────────── */
.admin-table__body :deep(tr) {
  border-bottom: 1px solid var(--border);
  transition: background 150ms ease;
}

.admin-table__body :deep(tr:last-child) {
  border-bottom: none;
}

.admin-table__body :deep(tr:hover) {
  background: var(--bg-secondary);
}

/* ─── Body cells ──────────────────────────────────────────── */
.admin-table__body :deep(td) {
  padding: 1rem 1.25rem;
  color: var(--text-primary);
  vertical-align: middle;
  white-space: nowrap;
}

/* ─── Skeleton loading ───────────────────────────────────── */
.admin-table__skeleton-row td {
  padding: 1rem 1.25rem;
}

.admin-table__skeleton-cell {
  height: 0.875rem;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  animation: admin-table__pulse 1.5s ease-in-out infinite;
}

@keyframes admin-table__pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* ─── Loading label ───────────────────────────────────────── */
.admin-table__loading-label {
  padding: 0.5rem 1.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  border-top: 1px solid var(--border);
}
</style>