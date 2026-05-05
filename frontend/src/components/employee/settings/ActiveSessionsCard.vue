<script setup lang="ts">
defineProps<{
  version: string;
  buildNumber: string;
  devices: string[];
  enrolledDevices: number;
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
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      </div>
      <div class="card-header-text">
        <p class="card-header-title">Active Sessions</p>
        <p class="card-header-sub">
          {{ enrolledDevices }} devices registered
        </p>
      </div>
      <div class="online-badge">
        <span class="online-dot" />
        <span>Online</span>
      </div>
    </div>
    <div class="session-list">
      <div
        v-for="(device, di) in devices"
        :key="di"
        class="session-item"
        :class="{ 'session-item--last': di === 0 }"
      >
        <div class="session-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="session-info">
          <p class="session-device">{{ device }}</p>
          <p class="session-status">
            <span v-if="di === 0" class="status-current"
              >Current session · Active now</span
            >
            <span v-else class="status-other">Active</span>
          </p>
        </div>
        <div v-if="di === 0" class="current-badge">Active</div>
      </div>
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

/* Online Badge */
.online-badge {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--success);
  white-space: nowrap;
}
.online-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 4px var(--success);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Session List */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6875rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: border-color 150ms;
}
.session-item--last {
  border-color: var(--accent-border);
  background: rgba(232, 146, 12, 0.04);
}
.session-icon {
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.session-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}
.session-info {
  flex: 1;
  min-width: 0;
}
.session-device {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}
.session-status {
  font-size: 0.75rem;
  margin-top: 0.0625rem;
}
.status-current {
  color: var(--accent);
}
.status-other {
  color: var(--text-muted);
}
.current-badge {
  padding: 0.1875rem 0.5rem;
  background: var(--accent-muted);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
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
