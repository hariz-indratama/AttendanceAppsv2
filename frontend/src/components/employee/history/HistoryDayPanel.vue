<script setup lang="ts">
import type { Attendance } from '@/types/attendance'
import type { AttendanceStatus } from './HistoryCalendar.vue'

interface CalendarDay {
  day: number | null
  date: Date | null
  attendance: Attendance | null
}

const props = defineProps<{
  isOpen: boolean
  day: CalendarDay | null
}>()

const emit = defineEmits<{
  close: []
}>()

function dayStatus(day: CalendarDay): AttendanceStatus {
  if (!day.attendance) return 'no_record'
  return day.attendance.status as AttendanceStatus
}

const badgeClass = (status: AttendanceStatus) => ({
  'text-[var(--success)] bg-[var(--success-muted)]': status === 'present',
  'text-[var(--warning)] bg-[var(--warning-muted)]': status === 'late',
  'text-[var(--danger)] bg-[var(--danger-muted)]': status === 'absent',
  'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]': status === 'half_day',
  'text-[var(--text-muted)] bg-[var(--bg)]': status === 'no_record',
})

const dotColor = (status: AttendanceStatus) => ({
  'bg-[var(--success)]': status === 'present',
  'bg-[var(--warning)]': status === 'late',
  'bg-[var(--danger)]': status === 'absent',
  'bg-[#60a5fa]': status === 'half_day',
})

const statusLabel: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  half_day: 'Half Day',
  no_record: 'No Record',
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatHours(h: number | null): string {
  if (h === null || h === undefined) return '—'
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

function formatFullDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="panel-overlay" @click.self="emit('close')">
      <div v-if="day" class="slide-panel">
        <!-- Panel Header -->
        <div class="panel-header">
          <div>
            <p class="panel-title">Attendance Details</p>
            <p class="panel-sub">{{ formatFullDate(day.date) }}</p>
          </div>
          <button @click="emit('close')" class="panel-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Panel Body -->
        <div class="panel-body">
          <!-- Status Badge -->
          <div class="status-badge" :class="badgeClass(dayStatus(day))">
            <span class="status-dot" :class="dotColor(dayStatus(day))" />
            {{ statusLabel[dayStatus(day)] }}
          </div>

          <!-- No Record -->
          <div v-if="!day.attendance" class="no-record">
            <div class="no-record-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="no-record-text">No attendance record</p>
            <p class="no-record-sub">You did not clock in on this day</p>
          </div>

          <!-- Attendance Details -->
          <template v-else>
            <div class="detail-grid">
              <div class="detail-card">
                <p class="detail-label">Clock In</p>
                <p class="detail-value">{{ formatTime(day.attendance.clock_in) }}</p>
              </div>
              <div class="detail-card">
                <p class="detail-label">Clock Out</p>
                <p class="detail-value">{{ formatTime(day.attendance.clock_out) }}</p>
              </div>
            </div>
            <div class="detail-card detail-card--wide">
              <p class="detail-label">Total Hours Worked</p>
              <p class="detail-value detail-value--lg">{{ formatHours(day.attendance.total_hours) }}</p>
            </div>
          </template>
        </div>

        <!-- Panel Footer -->
        <div class="panel-footer">
          <button @click="emit('close')" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}

.panel-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.slide-panel {
  position: relative;
  width: 18rem;
  max-width: 90vw;
  height: 100%;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  animation: slideIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
  padding-top: calc(1.5rem + env(safe-area-inset-top));
  gap: 0.5rem;
}

.panel-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.panel-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.panel-close {
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
  padding: 0;
}

.panel-close svg {
  width: 1rem;
  height: 1rem;
}

.panel-close:hover {
  background: var(--bg-card-alt);
  color: var(--text-primary);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  align-self: flex-start;
  border: 1px solid;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.no-record {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
  gap: 0.75rem;
}

.no-record-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-record-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-muted);
}

.no-record-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.no-record-sub {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}

.detail-card--wide {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.375rem;
}

.detail-value {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-primary);
}

.detail-value--lg {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.panel-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.close-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 0.75rem;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms;
}

.close-btn:hover {
  background: var(--accent-muted);
}
</style>
