<script setup lang="ts">
defineProps<{
  version: string;
  buildNumber: string;
}>();
</script>

<template>
  <div class="card info-card">
    <div class="card-header">
      <div class="card-header-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="card-header-text">
        <p class="card-header-title">Attendance</p>
        <p class="card-header-sub">Employee Portal v{{ version }}</p>
      </div>
      <span class="version-tag">Build {{ buildNumber }}</span>
    </div>
    <div class="app-info-links">
      <button class="info-link">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Privacy Policy</span>
        <svg
          class="info-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <button class="info-link">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Help & Support</span>
        <svg
          class="info-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <button class="info-link">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Terms of Service</span>
        <svg
          class="info-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.125rem 1rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025) inset,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 32px -4px rgba(0, 0, 0, 0.4);
  animation: fadeUp 300ms ease-out both;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}
.card-header-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-header-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}
.card-header-text {
  flex: 1;
  min-width: 0;
}
.card-header-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}
.card-header-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Version Tag */
.version-tag {
  padding: 0.1875rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  white-space: nowrap;
}

/* App Info Links */
.app-info-links {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.info-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.625rem;
  border-radius: 0.625rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    background 150ms,
    color 150ms;
}
.info-link svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
.info-link span {
  flex: 1;
}
.info-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}
.info-link:hover .info-chevron {
  color: var(--text-secondary);
  transform: translateX(3px);
  transition: transform 200ms ease;
}
.info-chevron {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-muted);
  flex-shrink: 0;
  transition:
    transform 200ms ease,
    color 150ms;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
