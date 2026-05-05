<script setup lang="ts">
defineProps<{
  currentTime: string;
  currentDate: string;
}>();
</script>

<template>
  <div class="card card--clock">
    <div class="clock-time">{{ currentTime }}</div>
    <div class="clock-date">{{ currentDate }}</div>
  </div>
</template>

<style scoped>
/* ─── Clock Card ─────────────────────────────────────────── */
.card--clock {
  text-align: center;
  padding: 2rem 1.5rem;
  animation: fadeIn 400ms ease-out;
  animation-delay: 60ms;
  animation-fill-mode: backwards;

  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025) inset,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 32px -4px rgba(0, 0, 0, 0.4);
}

.clock-time {
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  text-shadow: 0 0 2rem var(--accent-glow);
}

.clock-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
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