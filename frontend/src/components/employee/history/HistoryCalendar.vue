<script setup lang="ts">
import type { Attendance } from '@/types/attendance'

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day' | 'no_record'

interface CalendarDay {
  day: number | null
  date: Date | null
  attendance: Attendance | null
}

const props = defineProps<{
  calendarDays: CalendarDay[]
  isLoading: boolean
  todayDateStr: string
}>()

const emit = defineEmits<{
  'open-day': [day: CalendarDay]
}>()

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function dayDateStr(day: CalendarDay): string {
  if (!day.date) return ''
  const y = day.date.getFullYear()
  const m = String(day.date.getMonth() + 1).padStart(2, '0')
  const d = String(day.date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(day: CalendarDay): boolean {
  return dayDateStr(day) === props.todayDateStr
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

const legendItems: Array<[string, string]> = [
  ['Present', 'var(--success)'],
  ['Late', 'var(--warning)'],
  ['Absent', 'var(--danger)'],
  ['Half Day', '#60a5fa'],
]
</script>

<template>
  <div class="calendar-card card">
    <!-- Day Headers -->
    <div class="calendar-grid-header">
      <span v-for="name in dayNames" :key="name" class="day-name">{{ name }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="calendar-skeleton">
      <div v-for="i in 35" :key="i" class="skel-cell" />
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-grid">
      <button
        v-for="(day, idx) in calendarDays"
        :key="idx"
        @click="emit('open-day', day)"
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
      <div v-for="[label, color] in legendItems" :key="label" class="legend-item">
        <span class="legend-dot" :style="{ background: color }" />
        <span class="legend-label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
  padding: 0.75rem 1rem 1rem;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
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

/* Skeleton */
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

/* Legend */
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
</style>
