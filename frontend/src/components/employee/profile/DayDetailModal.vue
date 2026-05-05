<script setup lang="ts">
import type { Attendance } from '@/types/attendance'

const props = defineProps<{
  selectedDay: { day: number | null; record: Attendance | null } | null
  calendarYear: number
  calendarMonth: number
}>()

const emit = defineEmits<{
  'close': []
}>()

const statusColorMap: Record<string, string> = {
  present: 'text-[var(--success)] bg-[var(--success-muted)]',
  late: 'text-[var(--warning)] bg-[var(--warning-muted)]',
  absent: 'text-[var(--danger)] bg-[var(--danger-muted)]',
  half_day: 'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]',
}

function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="selectedDay" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal">
        <div class="modal-header">
          <p class="modal-date">
            {{ new Date(calendarYear, calendarMonth, selectedDay.day ?? 1).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
          </p>
          <button @click="emit('close')" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <template v-if="selectedDay.record">
            <div class="modal-grid">
              <div class="modal-card">
                <p class="modal-key">Clock In</p>
                <p class="modal-val">{{ formatTime(selectedDay.record.clock_in) }}</p>
              </div>
              <div class="modal-card">
                <p class="modal-key">Clock Out</p>
                <p class="modal-val">{{ formatTime(selectedDay.record.clock_out) }}</p>
              </div>
            </div>
            <div class="modal-card modal-card--wide">
              <p class="modal-key">Total Hours</p>
              <p class="modal-val modal-val--lg">{{ (selectedDay.record.total_hours ?? 0).toFixed(2) }}h</p>
            </div>
            <div>
              <p class="modal-key" style="margin-bottom: 0.5rem">Status</p>
              <span class="status-pill" :class="statusColorMap[selectedDay.record.status] ?? ''">
                {{ selectedDay.record.status }}
              </span>
            </div>
          </template>
          <div v-else class="modal-empty">
            <p class="modal-empty-text">No attendance record for this day.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 200ms ease-out;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 22rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.5rem 1.5rem 1rem 1rem;
  overflow: hidden;
  animation: slideUp 300ms cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a2540, #0f172a);
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-date {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  transition: background 150ms;
}

.modal-close svg { width: 0.875rem; height: 0.875rem; }
.modal-close:hover { background: var(--bg-card-alt); }

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.modal-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}

.modal-card--wide { grid-column: 1 / -1; }

.modal-key {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.modal-val {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text-primary);
}

.modal-val--lg {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
}

.status-pill {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.modal-empty { text-align: center; padding: 1.5rem 0; }
.modal-empty-text { font-size: 0.9375rem; color: var(--text-muted); }
</style>
