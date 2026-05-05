<script setup lang="ts">
import type { Attendance } from '@/types/attendance'

const props = defineProps<{
  hoursThisMonth: number
  daysWorked: number
  lateCount: number
  isLoading: boolean
}>()
</script>

<template>
  <div class="card" style="animation-delay: 160ms">
    <h3 class="card-title">Work Stats</h3>
    <div v-if="isLoading" class="stats-skeleton">
      <div v-for="i in 3" :key="i" class="skel-stat" />
    </div>
    <div v-else class="stats-row">
      <div class="stat-item">
        <p class="stat-val">{{ hoursThisMonth.toFixed(1) }}</p>
        <p class="stat-lbl">Hours</p>
      </div>
      <div class="stat-item">
        <p class="stat-val">{{ daysWorked }}</p>
        <p class="stat-lbl">Days Worked</p>
      </div>
      <div class="stat-item">
        <p class="stat-val">{{ lateCount }}</p>
        <p class="stat-lbl">Late</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

.card-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 0.5rem;
  text-align: center;
}

.stat-val {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-lbl {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.stats-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.skel-stat { height: 4.5rem; background: var(--border); border-radius: 0.75rem; animation: pulse 1.5s ease-in-out infinite; }
</style>
