<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import apiClient from '@/api/axios'
import type { Attendance } from '@/types/auth'

interface CalendarDay {
  day: number | null
  date: Date | null
  attendance: Attendance | null
}

type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'no_record'

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const allRecords = ref<Attendance[]>([])
const isLoading = ref(true)
const selectedDay = ref<CalendarDay | null>(null)
const isPanelOpen = ref(false)

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
)

const calendarDays = computed<CalendarDay[]>(() =>
  buildCalendarDays(currentYear.value, currentMonth.value)
)

const daysWorked = computed(() =>
  allRecords.value.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'half_day').length
)

const totalHoursThisMonth = computed(() =>
  allRecords.value.reduce((sum, r) => sum + (r.total_hours ?? 0), 0)
)

const lateCount = computed(() =>
  allRecords.value.filter(r => r.status === 'late').length
)

const todayDateStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const startPadding = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: CalendarDay[] = []
  for (let i = 0; i < startPadding; i++) {
    days.push({ day: null, date: null, attendance: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const record = allRecords.value.find(r => {
      if (!r.clock_in) return false
      return r.clock_in.slice(0, 10) === dateStr
    }) ?? null
    days.push({ day: d, date, attendance: record })
  }
  return days
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function openDay(day: CalendarDay) {
  if (day.day === null) return
  selectedDay.value = day
  isPanelOpen.value = true
}

function closePanel() {
  isPanelOpen.value = false
  selectedDay.value = null
}

function dayDateStr(day: CalendarDay): string {
  if (!day.date) return ''
  const y = day.date.getFullYear()
  const m = String(day.date.getMonth() + 1).padStart(2, '0')
  const d = String(day.date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(day: CalendarDay): boolean {
  return dayDateStr(day) === todayDateStr.value
}

function dayStatus(day: CalendarDay): AttendanceStatus {
  if (!day.attendance) return 'no_record'
  return day.attendance.status as AttendanceStatus
}

const dotColor = (status: AttendanceStatus) => ({
  'bg-[var(--success)]': status === 'present',
  'bg-[var(--warning)]': status === 'late',
  'bg-[var(--danger)]': status === 'absent',
  'bg-[#60a5fa]': status === 'half_day',
})

const badgeClass = (status: AttendanceStatus) => ({
  'text-[var(--success)] bg-[var(--success-muted)]': status === 'present',
  'text-[var(--warning)] bg-[var(--warning-muted)]': status === 'late',
  'text-[var(--danger)] bg-[var(--danger-muted)]': status === 'absent',
  'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]': status === 'half_day',
  'text-[var(--text-muted)] bg-[var(--bg)]': status === 'no_record',
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

async function fetchHistory(): Promise<void> {
  isLoading.value = true
  try {
    const res = await apiClient.get<{ data: Attendance[] }>('/api/attendance/history', {
      params: { per_page: 100 },
    })
    allRecords.value = res.data.data
  } catch {
    allRecords.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchHistory)
</script>

<template>
  <div class="page">
    <!-- Title -->
    <div class="page-title-block" style="animation-delay: 0ms">
      <h1 class="page-title">Attendance History</h1>
      <p class="page-sub">{{ monthLabel }}</p>
    </div>

    <!-- Calendar Card -->
    <div class="card calendar-card" style="animation-delay: 80ms">
      <!-- Month Navigator -->
      <div class="month-nav">
        <button @click="prevMonth" class="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="month-label">{{ monthLabel }}</span>
        <button @click="nextMonth" class="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Day Headers -->
      <div class="calendar-grid-header">
        <span v-for="name in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="name" class="day-name">{{ name }}</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="calendar-skeleton">
        <div v-for="i in 35" :key="i" class="skel-cell" />
      </div>

      <!-- Calendar Grid -->
      <div v-else class="calendar-grid">
        <button
          v-for="(day, idx) in calendarDays"
          :key="idx"
          @click="openDay(day)"
          :disabled="day.day === null"
          class="day-cell"
          :class="{
            'day-cell--empty': day.day === null,
            'day-cell--has-record': day.day !== null && day.attendance,
            'day-cell--today': isToday(day),
          }"
        >
          <span v-if="day.day !== null" class="day-number" :class="isToday(day) ? 'day-number--today' : ''">
            {{ day.day }}
          </span>
          <span
            v-if="day.day !== null && dayStatus(day) !== 'no_record'"
            class="day-dot"
            :class="dotColor(dayStatus(day))"
          />
        </button>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div v-for="[label, color] in [
          ['Present', 'var(--success)'],
          ['Late', 'var(--warning)'],
          ['Absent', 'var(--danger)'],
          ['Half Day', '#60a5fa'],
        ]" :key="label" class="legend-item">
          <span class="legend-dot" :style="{ background: color }" />
          <span class="legend-label">{{ label }}</span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-grid" style="animation-delay: 160ms">
      <div class="summary-stat">
        <p class="summary-value">{{ daysWorked }}</p>
        <p class="summary-label">Days Worked</p>
      </div>
      <div class="summary-stat">
        <p class="summary-value">{{ formatHours(totalHoursThisMonth) }}</p>
        <p class="summary-label">Total Hours</p>
      </div>
      <div class="summary-stat">
        <p class="summary-value">{{ lateCount }}</p>
        <p class="summary-label">Late Days</p>
      </div>
    </div>

    <!-- Day Detail Slide-Over -->
    <Teleport to="body">
      <div v-if="isPanelOpen" class="panel-overlay" @click.self="closePanel">
        <div v-if="selectedDay" class="slide-panel">
          <!-- Panel Header -->
          <div class="panel-header">
            <div>
              <p class="panel-title">Attendance Details</p>
              <p class="panel-sub">{{ formatFullDate(selectedDay.date) }}</p>
            </div>
            <button @click="closePanel" class="panel-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Panel Body -->
          <div class="panel-body">
            <!-- Status Badge -->
            <div class="status-badge" :class="badgeClass(dayStatus(selectedDay))">
              <span class="status-dot" :class="dotColor(dayStatus(selectedDay))" />
              {{ statusLabel[dayStatus(selectedDay)] }}
            </div>

            <!-- No Record -->
            <div v-if="!selectedDay.attendance" class="no-record">
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
                  <p class="detail-value">{{ formatTime(selectedDay.attendance.clock_in) }}</p>
                </div>
                <div class="detail-card">
                  <p class="detail-label">Clock Out</p>
                  <p class="detail-value">{{ formatTime(selectedDay.attendance.clock_out) }}</p>
                </div>
              </div>
              <div class="detail-card detail-card--wide">
                <p class="detail-label">Total Hours Worked</p>
                <p class="detail-value detail-value--lg">{{ formatHours(selectedDay.attendance.total_hours) }}</p>
              </div>
            </template>
          </div>

          <!-- Panel Footer -->
          <div class="panel-footer">
            <button @click="closePanel" class="close-btn">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* All styles consume global CSS tokens from base.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
  font-family: var(--font-body);
  animation: fadeUp 400ms ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Title ──────────────────────────────────────────────── */
.page-title-block {
  animation: fadeUp 300ms ease-out both;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.page-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* ─── Card ──────────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

/* ─── Month Nav ──────────────────────────────────────────── */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.nav-btn {
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  padding: 0;
}

.nav-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

.nav-btn:hover {
  background: var(--bg-card-alt);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.month-label {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* ─── Calendar ───────────────────────────────────────────── */
.calendar-card {
  padding: 0.75rem 1rem 1rem;
}

.calendar-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.375rem;
}

.day-name {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.5rem 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  background: transparent;
  border: none;
  cursor: pointer;
  gap: 0.125rem;
  transition: background 150ms;
  padding: 0;
  min-width: 0;
}

.day-cell:hover:not(.day-cell--empty) {
  background: var(--bg-card-alt);
}

.day-cell--empty {
  cursor: default;
}

.day-cell--has-record {
  background: rgba(255,255,255,0.03);
}

.day-cell--today {
  box-shadow: 0 0 0 2px var(--accent);
}

.day-number {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}

.day-number--today {
  color: var(--accent);
  font-weight: 700;
}

.day-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── Skeleton ───────────────────────────────────────────── */
.calendar-skeleton {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.skel-cell {
  aspect-ratio: 1;
  border-radius: 0.625rem;
  background: var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

/* ─── Legend ──────────────────────────────────────────────── */
.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.legend-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.6875rem;
  color: var(--text-muted);
}

/* ─── Summary Stats ─────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  animation: fadeUp 300ms ease-out both;
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

/* ─── Panel Overlay ──────────────────────────────────────── */
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

/* ─── Slide Panel ────────────────────────────────────────── */
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

/* ─── No Record ──────────────────────────────────────────── */
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

/* ─── Detail Cards ───────────────────────────────────────── */
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

/* ─── Panel Footer ───────────────────────────────────────── */
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
