<script setup lang="ts">
import type { Attendance } from '@/types/attendance'
import AttendanceCalendar from './AttendanceCalendar.vue'

const props = defineProps<{
  attendanceHistory: Attendance[]
  calendarYear: number
  calendarMonth: number
  isLoadingHistory: boolean
  monthLabel: string
}>()

const emit = defineEmits<{
  'prev-month': []
  'next-month': []
  'select-day': [dayInfo: { day: number | null; record: Attendance | null }]
}>()
</script>

<template>
  <div class="tab-content">
    <!-- Month Navigator -->
    <div class="month-nav" style="animation-delay: 120ms">
      <button @click="emit('prev-month')" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="month-label">{{ monthLabel }}</span>
      <button @click="emit('next-month')" class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Calendar -->
    <AttendanceCalendar
      :attendanceHistory="attendanceHistory"
      :calendarYear="calendarYear"
      :calendarMonth="calendarMonth"
      :isLoading="isLoadingHistory"
      @select-day="(dayInfo) => emit('select-day', dayInfo)"
    />
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeUp 300ms ease-out both;
}

.month-label {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-btn {
  width: 2rem;
  height: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms;
  padding: 0;
}

.nav-btn svg { width: 0.875rem; height: 0.875rem; }
.nav-btn:hover { background: var(--bg-card-alt); }
</style>
