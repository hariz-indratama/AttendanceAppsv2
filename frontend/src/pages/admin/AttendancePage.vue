<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import apiClient from '@/api/axios'
import type { Attendance } from '@/types/attendance'
import type { PaginatedResponse } from '@/types/auth'
import type { SortKey, SortState } from '@/components/admin/attendance/AttendanceTable.vue'
import type { AttendanceRecord } from '@/components/admin/attendance/AttendanceTable.vue'
import type { AttendanceFiltersState } from '@/components/admin/attendance/AttendanceFilters.vue'
import AttendanceFilters from '@/components/admin/attendance/AttendanceFilters.vue'
import AttendanceTable from '@/components/admin/attendance/AttendanceTable.vue'
import AttendancePagination from '@/components/admin/attendance/AttendancePagination.vue'
import AttendanceDetailPanel from '@/components/admin/attendance/AttendanceDetailPanel.vue'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawAttendanceRecord extends Attendance {
  user: { id: number; name: string }
}

// ─── State ─────────────────────────────────────────────────────────────────────

const attendance = ref<AttendanceRecord[]>([])
const isLoading = ref(false)

const currentPage = ref(1)
const lastPage = ref(1)
const totalRecords = ref(0)
const perPage = ref(20)

const sort = ref<SortState>({ key: 'clock_in', order: 'desc' })

const defaultFilters: AttendanceFiltersState = {
  startDate: '',
  endDate: '',
  status: '',
  userId: '',
}

const filters = ref<AttendanceFiltersState>({ ...defaultFilters })

const isDetailsOpen = ref(false)
const selectedRecord = ref<AttendanceRecord | null>(null)

// ─── API calls ─────────────────────────────────────────────────────────────────

async function fetchAttendance(page = 1): Promise<void> {
  isLoading.value = true
  try {
    const res = await apiClient.get<PaginatedResponse<RawAttendanceRecord>>('/admin/attendances', {
      params: {
        start_date: filters.value.startDate || undefined,
        end_date: filters.value.endDate || undefined,
        status: filters.value.status || undefined,
        user_id: filters.value.userId || undefined,
        page,
      },
    })
    attendance.value = res.data.data.map((item) => ({
      ...item,
      employee_name: item.user?.name ?? 'Unknown',
    }))
    currentPage.value = res.data.meta.current_page
    lastPage.value = res.data.meta.last_page
    totalRecords.value = res.data.meta.total
  } catch {
    attendance.value = []
  } finally {
    isLoading.value = false
  }
}

// ─── Event handlers ─────────────────────────────────────────────────────────────

function onFiltersApply(): void {
  currentPage.value = 1
  fetchAttendance()
}

function onFiltersClear(): void {
  currentPage.value = 1
  fetchAttendance()
}

function onSort(key: SortKey): void {
  if (sort.value.key === key) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.key = key
    sort.value.order = 'asc'
  }
}

function onViewRecord(record: AttendanceRecord): void {
  selectedRecord.value = record
  isDetailsOpen.value = true
}

function onCloseDetails(): void {
  isDetailsOpen.value = false
  selectedRecord.value = null
}

function onPrevPage(): void {
  if (currentPage.value > 1) {
    fetchAttendance(currentPage.value - 1)
  }
}

function onNextPage(): void {
  if (currentPage.value < lastPage.value) {
    fetchAttendance(currentPage.value + 1)
  }
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportCsv(): void {
  const headers = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status']

  const formatDate = (isoString: string | null): string => {
    if (!isoString) return '—'
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return '—'
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatHours = (hours: number | null): string => {
    if (hours === null || hours === undefined) return '—'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  const statusLabel = (status: string): string => {
    switch (status) {
      case 'present':  return 'Present'
      case 'late':     return 'Late'
      case 'absent':   return 'Absent'
      case 'half_day': return 'Half Day'
      default:         return status
    }
  }

  const rows = attendance.value.map((r) => [
    r.employee_name,
    formatDate(r.clock_in),
    formatTime(r.clock_in),
    formatTime(r.clock_out),
    formatHours(r.total_hours),
    statusLabel(r.status),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'attendance-export.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

function initFilters(): void {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const formatDateForInput = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  filters.value = {
    startDate: formatDateForInput(firstOfMonth),
    endDate: formatDateForInput(today),
    status: '',
    userId: '',
  }
}

watch(
  () => filters.value.status,
  () => { onFiltersApply() }
)

onMounted(() => {
  initFilters()
  fetchAttendance()
})
</script>

<template>
  <div style="background: var(--admin-bg); min-height: 100vh; padding: 1.5rem;">
    <!-- Page header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--admin-text);">Attendance</h1>
        <p class="text-sm mt-1" style="color: var(--admin-text-secondary);">Track and manage employee attendance records</p>
      </div>
      <button
        @click="exportCsv"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
        style="background: var(--admin-card); color: var(--admin-text-secondary); border: 1px solid var(--admin-border); box-shadow: 0 1px 2px rgba(0,0,0,0.3);"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <AttendanceFilters
      v-model="filters"
      @apply="onFiltersApply"
      @clear="onFiltersClear"
    />

    <!-- Table card with pagination -->
    <div>
      <AttendanceTable
        :records="attendance"
        :sort="sort"
        :is-loading="isLoading"
        @sort="onSort"
        @view="onViewRecord"
      />

      <AttendancePagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total-records="totalRecords"
        :displayed-count="attendance.length"
        @prev="onPrevPage"
        @next="onNextPage"
      />
    </div>

    <!-- Details panel -->
    <AttendanceDetailPanel
      :record="selectedRecord"
      :is-open="isDetailsOpen"
      @close="onCloseDetails"
    />
  </div>
</template>

<style scoped>
/* ─── Design tokens (for fallback, components use CSS vars) ──────── */
.page {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #10b981;
  --admin-accent-muted: rgba(16, 185, 129, 0.12);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.1);
  --admin-warning: #fbbf24;
  --admin-warning-muted: rgba(251, 191, 36, 0.1);
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;
}
</style>
