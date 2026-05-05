<script setup lang="ts">
withDefaults(
  defineProps<{
    isClockedIn: boolean;
    isLoading: boolean;
    clockedInTime: string | null;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

defineEmits<{
  clockIn: [];
  clockOut: [];
}>();
</script>

<template>
  <div class="card card--action">
    <!-- Clocked In State -->
    <div v-if="isClockedIn !== undefined" class="action-state">
      <div class="action-icon-wrap action-icon-wrap--in">
        <svg
          class="action-icon"
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
      </div>
      <h2 class="action-title">Clocked In</h2>
      <p class="action-sub">Since {{ clockedInTime }}</p>
      <button
        @click="$emit('clockOut')"
        :disabled="isLoading"
        class="btn btn--danger"
      >
        <span v-if="isLoading" class="btn-content">
          <svg class="spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="2.5"
              opacity="0.3"
            />
            <path
              fill="currentColor"
              opacity="0.9"
              d="M12 3a9 9 0 019 9v0a9 9 0 01-9 9 9 9 0 01-9-9v0a9 9 0 019-9z"
            />
          </svg>
          Processing&hellip;
        </span>
        <span v-else class="btn-content">
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Clock Out
        </span>
      </button>
    </div>

    <!-- Not Clocked In State -->
    <div v-else class="action-state">
      <div class="action-icon-wrap action-icon-wrap--out">
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 class="action-title">Ready to Clock In?</h2>
      <p class="action-sub">Make sure you're at the office</p>
      <button
        @click="$emit('clockIn')"
        :disabled="isLoading || disabled"
        class="btn btn--primary"
      >
        <span v-if="isLoading" class="btn-content">
          <svg class="spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="2.5"
              opacity="0.3"
            />
            <path
              fill="currentColor"
              opacity="0.9"
              d="M12 3a9 9 0 019 9v0a9 9 0 01-9 9 9 9 0 01-9-9v0a9 9 0 019-9z"
            />
          </svg>
          Verifying&hellip;
        </span>
        <span v-else class="btn-content">
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Clock In
        </span>
      </button>
      <p v-if="disabled" class="action-hint">
        Enable location to clock in
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── Card Base ─────────────────────────────────────────── */
.card--action {
  padding: 1.75rem 1.5rem;
  text-align: center;
  animation: fadeIn 400ms ease-out;
  animation-delay: 180ms;
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

.action-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-icon-wrap {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  animation: iconPop 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes iconPop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.action-icon-wrap--in {
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.action-icon-wrap--out {
  background: var(--accent-muted);
  border: 1px solid rgba(232, 146, 12, 0.3);
}

.action-icon {
  width: 2rem;
  height: 2rem;
}

.action-icon-wrap--in .action-icon {
  color: var(--success);
}
.action-icon-wrap--out .action-icon {
  color: var(--accent);
}

.action-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.action-sub {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.action-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* ─── Buttons ───────────────────────────────────────────── */
.btn {
  width: 100%;
  padding: 0.9375rem 1.25rem;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    transform 150ms,
    box-shadow 150ms,
    background 150ms;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 60%
  );
  transform: translateX(-100%);
  transition: transform 400ms ease;
}

.btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.btn--primary {
  background: linear-gradient(135deg, #e8920c 0%, #f59e0b 100%);
  color: #0a0f1a;
  box-shadow:
    0 0 0 1px rgba(232, 146, 12, 0.3) inset,
    0 4px 1.5rem rgba(232, 146, 12, 0.25);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(232, 146, 12, 0.4) inset,
    0 8px 2rem rgba(232, 146, 12, 0.35);
}

.btn--primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn--danger {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  color: white;
  box-shadow:
    0 0 0 1px rgba(248, 113, 113, 0.3) inset,
    0 4px 1.5rem rgba(248, 113, 113, 0.25);
}

.btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(248, 113, 113, 0.4) inset,
    0 8px 2rem rgba(248, 113, 113, 0.35);
}

.btn--danger:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.spin {
  width: 1.125rem;
  height: 1.125rem;
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
</style>