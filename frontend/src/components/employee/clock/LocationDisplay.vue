<script setup lang="ts">
defineProps<{
  location: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
}>();

defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="card card--location">
    <div class="loc-row">
      <div
        class="loc-icon-wrap"
        :class="location ? 'loc-icon-wrap--ok' : 'loc-icon-wrap--loading'"
      >
        <svg
          v-if="location"
          class="loc-icon loc-icon--ok"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else-if="isLoading"
          class="loc-icon loc-icon--spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2"
            opacity="0.3"
          />
          <path
            fill="currentColor"
            opacity="0.8"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg
          v-else
          class="loc-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <div class="loc-info">
        <p class="loc-title">Location</p>
        <p v-if="location" class="loc-coords">
          {{ location.lat.toFixed(5) }}, {{ location.lng.toFixed(5) }}
        </p>
        <p v-else-if="error" class="loc-status loc-status--err">
          {{ error }}
        </p>
        <p v-else-if="isLoading" class="loc-status">
          Getting location&hellip;
        </p>
        <p v-else class="loc-status">Location unavailable</p>
      </div>
      <button
        v-if="!location && !error && !isLoading"
        @click="$emit('retry')"
        class="retry-btn"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ─── Card Base ─────────────────────────────────────────── */
.card--location {
  padding: 1.25rem;
  animation: fadeIn 400ms ease-out;
  animation-delay: 120ms;
  animation-fill-mode: backwards;

  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025) inset,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 32px -4px rgba(0, 0, 0, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loc-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.loc-icon-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg);
  border: 1px solid var(--border);
}

.loc-icon-wrap--ok {
  background: var(--success-muted);
  border-color: rgba(52, 211, 153, 0.3);
}

.loc-icon-wrap--loading {
  background: var(--bg);
}

.loc-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-muted);
}

.loc-icon--ok {
  color: var(--success);
}

.loc-icon--spin {
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loc-info {
  flex: 1;
  min-width: 0;
}

.loc-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.125rem;
}

.loc-coords {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--success);
  letter-spacing: 0.02em;
}

.loc-status {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.loc-status--err {
  color: var(--danger);
}

.retry-btn {
  padding: 0.375rem 0.875rem;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms;
  white-space: nowrap;
}

.retry-btn:hover {
  background: var(--accent-muted);
}
</style>