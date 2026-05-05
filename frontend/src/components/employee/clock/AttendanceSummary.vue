<script setup lang="ts">
interface AttendanceRecord {
  id: number;
  clock_in: string;
  clock_out: string | null;
  status: string;
  total_hours: number | null;
}

defineProps<{
  attendance: AttendanceRecord | null;
  clockedInTime: string | null;
}>();
</script>

<template>
  <div v-if="attendance" class="card card--summary">
    <h3 class="summary-title">Today's Summary</h3>
    <div class="summary-grid">
      <div class="summary-stat">
        <p class="stat-label">Clock In</p>
        <p class="stat-value">{{ clockedInTime || "--:--" }}</p>
      </div>
      <div class="summary-stat">
        <p class="stat-label">Hours</p>
        <p class="stat-value">
          {{ attendance.total_hours?.toFixed(1) || "0.0"
          }}<span class="stat-unit">h</span>
        </p>
      </div>
      <div class="summary-stat">
        <p class="stat-label">Status</p>
        <p
          class="stat-value stat-value--badge"
          :class="`stat-value--${attendance.status}`"
        >
          {{ attendance.status }}
        </p>
      </div>
      <div class="summary-stat">
        <p class="stat-label">Clock Out</p>
        <p class="stat-value">
          {{
            attendance.clock_out
              ? new Date(attendance.clock_out).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit" },
                )
              : "--:--"
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Card Base ─────────────────────────────────────────── */
.card--summary {
  padding: 1.25rem;
  animation: fadeIn 400ms ease-out;
  animation-delay: 240ms;
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

.summary-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.summary-stat {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-muted);
}

.stat-value--present {
  color: var(--success);
}
.stat-value--late {
  color: var(--warning);
}
.stat-value--absent {
  color: var(--danger);
}

.stat-value--badge {
  font-size: 0.9375rem;
  text-transform: capitalize;
}
</style>