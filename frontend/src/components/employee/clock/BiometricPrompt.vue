<script setup lang="ts">
defineProps<{
  isVerifying: boolean;
  error: string | null;
}>();
</script>

<template>
  <!-- Biometric verification state indicator -->
  <div v-if="isVerifying" class="biometric-indicator">
    <div class="biometric-icon">
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
    </div>
    <span class="biometric-text">Verifying biometrics...</span>
  </div>
</template>

<style scoped>
.biometric-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-muted);
  border: 1px solid rgba(232, 146, 12, 0.3);
  border-radius: 0.75rem;
  color: var(--accent);
  font-size: 0.875rem;
  font-weight: 500;
}

.biometric-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.biometric-icon .spin {
  width: 1.25rem;
  height: 1.25rem;
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

.biometric-text {
  font-family: var(--font-body);
}
</style>