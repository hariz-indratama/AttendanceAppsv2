<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import apiClient from '@/api/axios'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyAttendanceRow {
  employee_name: string
  days_present: number
  days_late: number
  total_hours: number
}

interface LateArrivalRow {
  employee_name: string
  date: string
  clock_in_time: string
  delay_minutes: number
}

interface OvertimeRow {
  employee_name: string
  overtime_hours: number
}

interface ReportsSummary {
  monthly_attendance: MonthlyAttendanceRow[]
  late_arrivals: LateArrivalRow[]
  overtime: OvertimeRow[]
}

// ─── State ─────────────────────────────────────────────────────────────────────

const startDate = ref('')
const endDate = ref('')

const monthlyAttendance = ref<MonthlyAttendanceRow[]>([])
const lateArrivals = ref<LateArrivalRow[]>([])
const overtime = ref<OvertimeRow[]>([])

const isLoading = ref(false)
const isExporting = ref(false)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateDisplay(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round(hours - h)
  if (m === 0) return `${h}h`
  return `${h}h ${m * 60}m`
}

function formatDelayMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── API calls ─────────────────────────────────────────────────────────────────

async function fetchReports(): Promise<void> {
  if (!startDate.value || !endDate.value) return

  isLoading.value = true
  try {
    const res = await apiClient.get<ReportsSummary>('/admin/reports/summary', {
      params: { start_date: startDate.value, end_date: endDate.value },
    })
    monthlyAttendance.value = res.data.monthly_attendance ?? []
    lateArrivals.value = res.data.late_arrivals ?? []
    overtime.value = res.data.overtime ?? []
  } catch {
    monthlyAttendance.value = []
    lateArrivals.value = []
    overtime.value = []
  } finally {
    isLoading.value = false
  }
}

async function exportPdf(): Promise<void> {
  if (!startDate.value || !endDate.value) return

  isExporting.value = true
  try {
    const res = await apiClient.get('/admin/reports/export', {
      params: { start_date: startDate.value, end_date: endDate.value, format: 'csv' },
      responseType: 'blob',
    })

    const blob = new Blob([JSON.stringify(res.data.data)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-report-${startDate.value}-to-${endDate.value}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('PDF export failed:', err)
  } finally {
    isExporting.value = false
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    fetchReports()
  }
})

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  startDate.value = formatDateForInput(firstOfMonth)
  endDate.value = formatDateForInput(today)

  fetchReports()
})
</script>

<template>
  <div class="page">
    <!-- Page header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-admin-title">Reports</h1>
        <p class="text-sm text-admin-secondary mt-1">Attendance summaries and analytics</p>
      </div>
      <button
        @click="exportPdf"
        :disabled="isExporting || !startDate || !endDate"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-admin-accent hover:bg-admin-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-admin-btn transition-colors"
      >
        <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <svg v-else class="w-4 h-4 animate-admin-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ isExporting ? 'Exporting…' : 'Export PDF' }}
      </button>
    </div>

    <!-- Date range bar -->
    <div class="bg-admin-card rounded-admin-card shadow-admin border-admin-border p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- From date -->
        <div>
          <label class="block text-xs font-medium text-admin-secondary uppercase tracking-wider mb-1.5">From Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2.5 bg-admin-bg border-admin-border text-sm text-admin-title rounded-admin-input focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-transparent transition-colors"
          />
        </div>

        <!-- To date -->
        <div>
          <label class="block text-xs font-medium text-admin-secondary uppercase tracking-wider mb-1.5">To Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2.5 bg-admin-bg border-admin-border text-sm text-admin-title rounded-admin-input focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-transparent transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Monthly Attendance card -->
    <div class="bg-admin-card rounded-admin-card shadow-admin border-admin-border overflow-hidden mb-6">
      <div class="px-6 py-4 border-admin-border">
        <h2 class="text-base font-semibold text-admin-title">Monthly Attendance</h2>
        <p class="text-xs text-admin-secondary mt-0.5">
          Employee attendance summary for the selected period
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y divide-admin-border">
        <div v-for="i in 5" :key="i" class="px-6 py-4 flex items-center gap-4">
          <div class="flex-1 grid grid-cols-4 gap-4">
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else-if="monthlyAttendance.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-160">
          <thead>
            <tr class="bg-admin-bg text-xs uppercase text-admin-secondary tracking-wider">
              <th class="px-6 py-3 text-left font-semibold">Employee</th>
              <th class="px-6 py-3 text-left font-semibold">Days Present</th>
              <th class="px-6 py-3 text-left font-semibold">Days Late</th>
              <th class="px-6 py-3 text-left font-semibold">Total Hours</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-border">
            <tr
              v-for="row in monthlyAttendance"
              :key="row.employee_name"
              class="hover:bg-admin-bg transition-colors"
            >
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-admin-title">{{ row.employee_name }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-admin-secondary">{{ row.days_present }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="row.days_late > 0"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-warning-muted text-admin-warning"
                >
                  {{ row.days_late }}
                </span>
                <span v-else class="text-sm text-admin-muted">0</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-admin-secondary">{{ formatHours(row.total_hours) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <div class="w-14 h-14 rounded-admin-card bg-admin-bg mx-auto mb-4 flex items-center justify-center">
          <svg class="w-6 h-6 text-admin-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm text-admin-secondary">No attendance data for this period</p>
        <p class="text-xs text-admin-muted mt-1">Adjust the date range and try again</p>
      </div>
    </div>

    <!-- Late Arrivals card -->
    <div class="bg-admin-card rounded-admin-card shadow-admin border-admin-border overflow-hidden mb-6">
      <div class="px-6 py-4 border-admin-border">
        <h2 class="text-base font-semibold text-admin-title">Late Arrivals</h2>
        <p class="text-xs text-admin-secondary mt-0.5">
          Clock-in delays recorded in the selected period
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y divide-admin-border">
        <div v-for="i in 5" :key="i" class="px-6 py-4 flex items-center gap-4">
          <div class="flex-1 grid grid-cols-4 gap-4">
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else-if="lateArrivals.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-160">
          <thead>
            <tr class="bg-admin-bg text-xs uppercase text-admin-secondary tracking-wider">
              <th class="px-6 py-3 text-left font-semibold">Employee</th>
              <th class="px-6 py-3 text-left font-semibold">Date</th>
              <th class="px-6 py-3 text-left font-semibold">Clock In</th>
              <th class="px-6 py-3 text-left font-semibold">Delay</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-border">
            <tr
              v-for="row in lateArrivals"
              :key="`${row.employee_name}-${row.date}`"
              class="hover:bg-admin-bg transition-colors"
            >
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-admin-title">{{ row.employee_name }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-admin-secondary">{{ formatDateDisplay(row.date) }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-admin-secondary font-mono">{{ row.clock_in_time }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-warning-muted text-admin-warning"
                >
                  {{ formatDelayMinutes(row.delay_minutes) }} late
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <div class="w-14 h-14 rounded-admin-card bg-admin-accent-muted mx-auto mb-4 flex items-center justify-center">
          <svg class="w-6 h-6 text-admin-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-sm text-admin-secondary">No late arrivals recorded</p>
        <p class="text-xs text-admin-muted mt-1">Everyone was on time during this period</p>
      </div>
    </div>

    <!-- Overtime card -->
    <div class="bg-admin-card rounded-admin-card shadow-admin border-admin-border overflow-hidden">
      <div class="px-6 py-4 border-admin-border">
        <h2 class="text-base font-semibold text-admin-title">Overtime</h2>
        <p class="text-xs text-admin-secondary mt-0.5">
          Total overtime hours per employee in the selected period
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y divide-admin-border">
        <div v-for="i in 5" :key="i" class="px-6 py-4 flex items-center gap-4">
          <div class="flex-1 grid grid-cols-2 gap-4">
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
            <div class="h-4 bg-admin-border rounded animate-admin-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else-if="overtime.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-[320px]">
          <thead>
            <tr class="bg-admin-bg text-xs uppercase text-admin-secondary tracking-wider">
              <th class="px-6 py-3 text-left font-semibold">Employee</th>
              <th class="px-6 py-3 text-left font-semibold">Overtime Hours</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-border">
            <tr
              v-for="row in overtime"
              :key="row.employee_name"
              class="hover:bg-admin-bg transition-colors"
            >
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-admin-title">{{ row.employee_name }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="row.overtime_hours > 0"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-admin-accent-muted text-admin-accent"
                >
                  {{ formatHours(row.overtime_hours) }}
                </span>
                <span v-else class="text-sm text-admin-muted">0h</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <div class="w-14 h-14 rounded-admin-card bg-admin-bg mx-auto mb-4 flex items-center justify-center">
          <svg class="w-6 h-6 text-admin-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm text-admin-secondary">No overtime recorded</p>
        <p class="text-xs text-admin-muted mt-1">No employees worked beyond regular hours</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────── */
.page {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #10b981;
  --admin-accent-hover: #059669;
  --admin-accent-muted: rgba(16, 185, 129, 0.12);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.1);
  --admin-warning: #fbbf24;
  --admin-warning-muted: rgba(251, 191, 36, 0.1);
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;

  background: var(--admin-bg);
}

/* ─── Text colors ────────────────────────────────────────────── */
.text-admin-title         { color: var(--admin-text); }
.text-admin-secondary     { color: var(--admin-text-secondary); }
.text-admin-muted        { color: var(--admin-text-muted); }
.text-admin-accent       { color: var(--admin-accent); }
.text-admin-warning      { color: var(--admin-warning); }

/* ─── Backgrounds ─────────────────────────────────────────────── */
.bg-admin-bg             { background: var(--admin-bg); }
.bg-admin-card           { background: var(--admin-card); }
.bg-admin-accent         { background: var(--admin-accent); }
.bg-admin-accent-hover   { background: var(--admin-accent-hover); }
.bg-admin-accent-muted   { background: var(--admin-accent-muted); }
.bg-admin-warning-muted  { background: var(--admin-warning-muted); }

/* ─── Borders ────────────────────────────────────────────────── */
.border-admin-border {
  border-bottom: 1px solid var(--admin-border);
}

/* ─── Shadows & radii ────────────────────────────────────────── */
.shadow-admin {
  box-shadow: var(--admin-shadow);
}
.rounded-admin-card {
  border-radius: var(--admin-radius);
}
.rounded-admin-btn {
  border-radius: 0.75rem;
}
.rounded-admin-input {
  border-radius: 0.75rem;
}

/* ─── Custom animations ──────────────────────────────────────── */
@keyframes admin-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes admin-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.animate-admin-pulse { animation: admin-pulse 1.5s ease-in-out infinite; }
.animate-admin-spin  { animation: admin-spin  1s   linear    infinite; }
</style>
