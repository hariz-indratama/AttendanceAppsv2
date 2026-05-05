<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useUiStore } from '@/store/ui'

interface Props {
  fallbackMessage?: string
}

withDefaults(defineProps<Props>(), {
  fallbackMessage: 'Something went wrong. Please try again.',
})

const hasError = ref(false)
const errorMessage = ref('')
const uiStore = useUiStore()

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMessage.value = err.message || 'An unexpected error occurred'

  // Show toast notification
  uiStore.showToast(
    `Error: ${err.message || 'An unexpected error occurred'}`,
    'error',
    5000
  )

  // Don't propagate to parent - we handle it here
  return false
})

function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div class="error-boundary">
    <!-- Error state -->
    <div v-if="hasError" class="error-fallback">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p class="error-message">{{ errorMessage || fallbackMessage }}</p>
      <button class="error-retry" @click="handleRetry">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 4v6h6M23 20v-6h-6" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        Try Again
      </button>
    </div>

    <!-- Normal content -->
    <slot v-else />
  </div>
</template>

<style scoped>
.error-boundary {
  display: contents;
}

.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: var(--danger-muted);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-lg);
  text-align: center;
  min-height: 200px;
}

.error-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--danger-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--danger);
}

.error-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.error-message {
  font-size: 0.9375rem;
  color: var(--danger-text);
  max-width: 300px;
}

.error-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 150ms;
}

.error-retry:hover {
  opacity: 0.9;
}

.error-retry svg {
  width: 1rem;
  height: 1rem;
}
</style>