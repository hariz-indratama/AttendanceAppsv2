<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import apiClient from '@/api/axios'
import type { Attendance } from '@/types/attendance'
import HistoryNav from '@/components/employee/history/HistoryNav.vue'
import HistoryCalendar from '@/components/employee/history/HistoryCalendar.vue'
import HistoryStats from '@/components/employee/history/HistoryStats.vue'
import HistoryDayPanel from '@/components/employee/history/HistoryDayPanel.vue'

interface CalendarDay {
  day: number | null
  date: Date | null
  attendance: Attendance | null
}

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

function formatHours(h: number | null): string {
  if (h === null || h === undefined) return '—'
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

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
    <div style="animation-delay: 80ms">
      <HistoryNav :month-label="monthLabel" @prev="prevMonth" @next="nextMonth" />
      <HistoryCalendar
        :calendar-days="calendarDays"
        :is-loading="isLoading"
        :today-date-str="todayDateStr"
        @open-day="openDay"
      />
    </div>

    <!-- Summary Stats -->
    <HistoryStats
      :days-worked="daysWorked"
      :total-hours="formatHours(totalHoursThisMonth)"
      :late-count="lateCount"
    />

    <!-- Day Detail Slide-Over -->
    <HistoryDayPanel
      :is-open="isPanelOpen"
      :day="selectedDay"
      @close="closePanel"
    />
  </div>
</template>

<style scoped>
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

/* Title */
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
</style>
