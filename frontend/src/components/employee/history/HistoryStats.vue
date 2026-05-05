<script setup lang="ts">
defineProps<{
  daysWorked: number
  totalHours: string
  lateCount: number
}>()
</script>

<template>
  <div class="summary-grid">
    <div class="summary-stat">
      <p class="summary-value">{{ daysWorked }}</p>
      <p class="summary-label">Days Worked</p>
    </div>
    <div class="summary-stat">
      <p class="summary-value">{{ totalHours }}</p>
      <p class="summary-label">Total Hours</p>
    </div>
    <div class="summary-stat">
      <p class="summary-value">{{ lateCount }}</p>
      <p class="summary-label">Late Days</p>
    </div>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  animation: fadeUp 300ms ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.summary-stat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1rem 0.5rem;
  text-align: center;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3);
}

.summary-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
</style>
