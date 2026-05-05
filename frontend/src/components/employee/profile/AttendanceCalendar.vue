<script setup lang="ts">
import { computed } from 'vue'
import type { Attendance } from '@/types/attendance'

const props = defineProps<{
  attendanceHistory: Attendance[]
  calendarYear: number
  calendarMonth: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  'select-day': [dayInfo: { day: number | null; record: Attendance | null }]
}>()

const calendarDays = computed(() => {
  const firstDay = new Date(props.calendarYear, props.calendarMonth, 1)
  const lastDay = new Date(props.calendarYear, props.calendarMonth + 1, 0)
  const startOffset = firstDay.getDay()
  const days: Array<{ day: number | null; record: Attendance | null }> = []
  for (let i = 0; i < startOffset; i++) {
    days.push({ day: null, record: null })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${props.calendarYear}-${String(props.calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const record = props.attendanceHistory.find(r => r.clock_in && r.clock_in.startsWith(dateStr)) ?? null
    days.push({ day: d, record })
  }
  return days
})

const monthLabel = computed(() =>
  new Date(props.calendarYear, props.calendarMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

function handleDayClick(item: { day: number | null; record: Attendance | null }) {
  if (item.day !== null) {
    emit('select-day', item)
  }
}
</script>

<template>
  <div class="card cal-card" style="animation-delay: 160ms">
    <div v-if="isLoading" class="cal-skeleton">
      <div v-for="i in 35" :key="i" class="skel-cal" />
    </div>
    <template v-else>
      <div class="cal-header">
        <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="cal-day-name">{{ d }}</span>
      </div>
      <div class="cal-grid">
        <button
          v-for="(item, idx) in calendarDays"
          :key="idx"
          @click="handleDayClick(item)"
          class="cal-cell"
          :class="{ 'cal-cell--null': item.day === null }"
        >
          <span v-if="item.day !== null" class="cal-day-num">{{ item.day }}</span>
          <span v-if="item.day !== null && item.record" class="cal-dot" :class="{
            'cal-dot--present': item.record.status === 'present',
            'cal-dot--late': item.record.status === 'late',
            'cal-dot--absent': item.record.status === 'absent',
            'cal-dot--half': item.record.status === 'half_day',
          }" />
          <span v-else-if="item.day !== null" class="cal-dot cal-dot--empty" />
        </button>
      </div>
      <div class="cal-legend">
        <div v-for="[lbl, cls] in [
          ['Present', 'cal-dot--present'],
          ['Late', 'cal-dot--late'],
          ['Absent', 'cal-dot--absent'],
        ]" :key="lbl" class="legend-item">
          <span class="cal-dot" :class="cls" />
          <span>{{ lbl }}</span>
        </div>
      </div>
    </template>
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

.cal-card {
  padding: 1rem;
}

.cal-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.375rem;
}

.cal-day-name {
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.375rem 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  gap: 0.125rem;
  padding: 0;
  transition: background 150ms;
}

.cal-cell:hover:not(.cal-cell--null) { background: var(--bg-card-alt); }
.cal-cell--null { cursor: default; }

.cal-day-num {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}

.cal-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.cal-dot--present { background: var(--success); }
.cal-dot--late    { background: var(--warning); }
.cal-dot--absent  { background: var(--danger); }
.cal-dot--half    { background: #60a5fa; }
.cal-dot--empty   { background: var(--border); }

.cal-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.cal-skeleton {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.skel-cal {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  background: var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
