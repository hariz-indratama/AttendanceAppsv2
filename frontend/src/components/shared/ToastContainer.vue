<script setup lang="ts">
import { useUiStore } from '@/store/ui'
import { computed } from 'vue'

const uiStore = useUiStore()

const toasts = computed(() => uiStore.toasts)

function getIconPath(type: string) {
  switch (type) {
    case 'success':
      return 'M5 13l4 4L19 7'
    case 'error':
      return 'M6 18L18 6M6 6l12 12'
    case 'warning':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          role="alert"
        >
          <div class="toast__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="getIconPath(toast.type)" />
            </svg>
          </div>
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            @click="uiStore.dismissToast(toast.id)"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  max-width: 400px;
  min-width: 280px;
  border: 1px solid transparent;
}

.toast--success {
  background: var(--bg-card);
  border-color: var(--success-border);
  color: var(--success-text);
}

.toast--error {
  background: var(--bg-card);
  border-color: var(--danger-border);
  color: var(--danger-text);
}

.toast--warning {
  background: var(--bg-card);
  border-color: rgba(245, 158, 11, 0.25);
  color: #b45309;
}

.toast--info {
  background: var(--bg-card);
  border-color: var(--accent-border);
  color: var(--accent);
}

.toast__icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast--success .toast__icon {
  background: var(--success-muted);
}

.toast--error .toast__icon {
  background: var(--danger-muted);
}

.toast--warning .toast__icon {
  background: rgba(245, 158, 11, 0.1);
}

.toast--info .toast__icon {
  background: var(--accent-muted);
}

.toast__icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.toast__message {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.toast__close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  opacity: 0.6;
  transition: opacity 150ms;
}

.toast__close:hover {
  opacity: 1;
}

.toast__close svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* ─── Transitions ─────────────────────────────────────────── */
.toast-enter-active {
  animation: toast-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: toast-slide-out 200ms ease-in forwards;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-slide-out {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>