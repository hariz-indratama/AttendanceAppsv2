<script setup lang="ts">
defineProps<{
  successMessage: string | null;
  error: string | null;
}>();
</script>

<template>
  <!-- Success Alert -->
  <transition name="alert-slide">
    <div v-if="successMessage" class="alert alert--success" role="alert">
      <svg
        class="alert-icon"
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
      <span>{{ successMessage }}</span>
    </div>
  </transition>

  <!-- Error Alert -->
  <transition name="alert-slide">
    <div
      v-if="error"
      class="alert alert--error"
      role="alert"
    >
      <svg
        class="alert-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{{ error }}</span>
    </div>
  </transition>
</template>

<style scoped>
/* ─── Alerts ─────────────────────────────────────────────── */
.alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  animation: fadeIn 200ms ease-out;
}

.alert--success {
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: var(--success);
}

.alert--error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: var(--danger);
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition:
    opacity 200ms,
    transform 200ms;
}
.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
</style>