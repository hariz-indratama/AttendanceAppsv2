<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/api/axios'
import type { Attendance, User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord extends Attendance {
  employee_name: string
}

interface RawAttendanceRecord extends Attendance {
  user: { id: number; name: string }
}

type SortKey = 'employee_name' | 'clock_in' | 'clock_out' | 'total_hours' | 'status'
type SortOrder = 'asc' | 'desc'
type StatusFilter = '' | 'present' | 'late' | 'absent' | 'half_day'

interface SortState {
  key: SortKey
  order: SortOrder
}

// ─── State ─────────────────────────────────────────────────────────────────────

const attendance = ref<AttendanceRecord[]>([])
const employees = ref<User[]>([])
const isLoading = ref(false)
const isLoadingEmployees = ref(false)

const currentPage = ref(1)
const lastPage = ref(1)
const totalRecords = ref(0)
const perPage = ref(20)

const sort = ref<SortState>({ key: 'clock_in', order: 'desc' })

const filters = ref({
  startDate: '',
  endDate: '',
  status: '' as StatusFilter,
  userId: '' as string,
})

const isDetailsOpen = ref(false)
const selectedRecord = ref<AttendanceRecord | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const displayedRecords = computed<AttendanceRecord[]>(() => {
  const records = [...attendance.value]

  records.sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null

    switch (sort.value.key) {
      case 'employee_name':
        aVal = a.employee_name.toLowerCase()
        bVal = b.employee_name.toLowerCase()
        break
      case 'clock_in':
        aVal = a.clock_in ?? ''
        bVal = b.clock_in ?? ''
        break
      case 'clock_out':
        aVal = a.clock_out ?? ''
        bVal = b.clock_out ?? ''
        break
      case 'total_hours':
        aVal = a.total_hours ?? -1
        bVal = b.total_hours ?? -1
        break
      case 'status':
        aVal = a.status ?? ''
        bVal = b.status ?? ''
        break
    }

    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.value.order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const cmp = String(aVal).localeCompare(String(bVal))
    return sort.value.order === 'asc' ? cmp : -cmp
  })

  return records
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string | null): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(isoString: string | null): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function statusColor(status: string): string {
  switch (status) {
    case 'present':  return 'var(--admin-accent)'
    case 'late':     return 'var(--admin-warning)'
    case 'absent':   return 'var(--admin-danger)'
    case 'half_day': return 'var(--admin-accent)'
    default:         return 'var(--admin-text-secondary)'
  }
}
function statusBg(status: string): string {
  switch (status) {
    case 'present':  return 'var(--admin-accent-muted)'
    case 'late':     return 'var(--admin-warning-muted)'
    case 'absent':   return 'var(--admin-danger-muted)'
    case 'half_day': return 'rgba(16,185,129,0.12)'
    default:         return 'var(--admin-bg)'
  }
}
function statusDotColor(status: string): string {
  switch (status) {
    case 'present':  return '#10b981'
    case 'late':     return '#fbbf24'
    case 'absent':   return '#f87171'
    case 'half_day': return '#10b981'
    default:         return '#6b7280'
  }
}
function statusConfig(status: string): { label: string } {
  switch (status) {
    case 'present':  return { label: 'Present' }
    case 'late':     return { label: 'Late' }
    case 'absent':   return { label: 'Absent' }
    case 'half_day': return { label: 'Half Day' }
    default:         return { label: status }
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Sort ──────────────────────────────────────────────────────────────────────

function toggleSort(key: SortKey): void {
  if (sort.value.key === key) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.key = key
    sort.value.order = 'asc'
  }
}

function sortIcon(key: SortKey): string {
  if (sort.value.key !== key) return '↕'
  return sort.value.order === 'asc' ? '↑' : '↓'
}

// ─── API calls ─────────────────────────────────────────────────────────────────

async function fetchEmployees(): Promise<void> {
  isLoadingEmployees.value = true
  try {
    const res = await apiClient.get<PaginatedResponse<User>>('/admin/employees', {
      params: { per_page: 100 },
    })
    employees.value = res.data.data
  } catch {
    employees.value = []
  } finally {
    isLoadingEmployees.value = false
  }
}

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

// ─── Filter actions ─────────────────────────────────────────────────────────────

function applyFilters(): void {
  currentPage.value = 1
  fetchAttendance()
}

function clearFilters(): void {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  filters.value = {
    startDate: formatDateForInput(firstOfMonth),
    endDate: formatDateForInput(today),
    status: '',
    userId: '',
  }
  currentPage.value = 1
  fetchAttendance()
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Details ───────────────────────────────────────────────────────────────────

function openDetails(record: AttendanceRecord): void {
  selectedRecord.value = record
  isDetailsOpen.value = true
}

function closeDetails(): void {
  isDetailsOpen.value = false
  selectedRecord.value = null
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportCsv(): void {
  const headers = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status']
  const rows = displayedRecords.value.map((r) => [
    r.employee_name,
    formatDate(r.clock_in),
    formatTime(r.clock_in),
    formatTime(r.clock_out),
    formatHours(r.total_hours),
    statusConfig(r.status).label,
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

// ─── Watchers ──────────────────────────────────────────────────────────────────

watch(
  () => filters.value.status,
  () => { applyFilters() }
)

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  filters.value.startDate = formatDateForInput(firstOfMonth)
  filters.value.endDate = formatDateForInput(today)

  fetchEmployees()
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

    <!-- Filter bar -->
    <div class="rounded-2xl shadow-lg border mb-6" style="background: var(--admin-card); border-color: var(--admin-border); box-shadow: var(--admin-shadow); padding: 1rem;">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- From date -->
        <div>
          <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">From Date</label>
          <input
            v-model="filters.startDate"
            @change="applyFilters"
            type="date"
            class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
            style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
          />
        </div>

        <!-- To date -->
        <div>
          <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">To Date</label>
          <input
            v-model="filters.endDate"
            @change="applyFilters"
            type="date"
            class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
            style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
          />
        </div>

        <!-- Status filter -->
        <div>
          <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
            style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="half_day">Half Day</option>
          </select>
        </div>

        <!-- Employee filter -->
        <div>
          <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">Employee</label>
          <select
            v-model="filters.userId"
            @change="applyFilters"
            :disabled="isLoadingEmployees"
            class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
            style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none; opacity: 0.5;"
          >
            <option value="">All Employees</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Clear filters -->
      <div class="mt-3 flex justify-end">
        <button
          @click="clearFilters"
          class="text-xs font-medium transition-colors"
          style="color: var(--admin-text-secondary);"
        >
          Clear filters
        </button>
      </div>
    </div>

    <!-- Table card -->
    <div class="rounded-2xl shadow-lg border overflow-hidden" style="background: var(--admin-card); border-color: var(--admin-border); box-shadow: var(--admin-shadow);">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y" style="border-color: var(--admin-border);">
        <div v-for="i in 6" :key="i" class="px-6 py-4 flex items-center gap-4">
          <div class="w-9 h-9 rounded-full shrink-0" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
          <div class="flex-1 grid grid-cols-5 gap-4">
            <div class="h-4 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
            <div class="h-4 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
            <div class="h-4 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
            <div class="h-4 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
            <div class="h-4 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
          </div>
          <div class="w-16 h-8 rounded" style="background: var(--admin-border); animation: admin-pulse 1.5s ease-in-out infinite;"></div>
        </div>
      </div>

      <!-- Table -->
      <div v-else-if="displayedRecords.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-[768px]">
          <thead>
            <tr class="text-xs uppercase tracking-wider" style="background: var(--admin-bg); color: var(--admin-text-secondary);">
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('employee_name')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Employee
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('employee_name') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('clock_in')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Date
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_in') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('clock_in')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Clock In
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_in') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('clock_out')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Clock Out
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_out') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('total_hours')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Total Hours
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('total_hours') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-left font-semibold">
                <button @click="toggleSort('status')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                  Status
                  <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('status') }}</span>
                </button>
              </th>
              <th class="px-6 py-3 text-right font-semibold" style="color: var(--admin-text-secondary);">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y" style="border-color: var(--admin-border);">
            <tr
              v-for="record in displayedRecords"
              :key="record.id"
              class="transition-colors"
              style="color: var(--admin-text-secondary);"
            >
              <!-- Employee -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style="background: var(--admin-accent-muted);">
                    <span class="text-xs font-semibold" style="color: var(--admin-accent);">{{ getInitials(record.employee_name) }}</span>
                  </div>
                  <span class="text-sm font-medium truncate max-w-[160px]" style="color: var(--admin-text);">{{ record.employee_name }}</span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-6 py-4">
                <span class="text-sm" style="color: var(--admin-text-secondary);">{{ formatDate(record.clock_in) }}</span>
              </td>

              <!-- Clock In -->
              <td class="px-6 py-4">
                <span class="text-sm font-mono" style="color: var(--admin-text-secondary);">{{ formatTime(record.clock_in) }}</span>
              </td>

              <!-- Clock Out -->
              <td class="px-6 py-4">
                <span class="text-sm font-mono" style="color: var(--admin-text-secondary);">{{ formatTime(record.clock_out) }}</span>
              </td>

              <!-- Total Hours -->
              <td class="px-6 py-4">
                <span class="text-sm" style="color: var(--admin-text-secondary);">{{ formatHours(record.total_hours) }}</span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                  :style="{ color: statusColor(record.status), background: statusBg(record.status) }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :style="{ background: statusDotColor(record.status) }"></span>
                  {{ statusConfig(record.status).label }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <button
                  @click="openDetails(record)"
                  class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                  style="color: var(--admin-accent);"
                >
                  View details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background: var(--admin-bg);">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--admin-text-muted);">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm" style="color: var(--admin-text-secondary);">No attendance records found</p>
        <p class="text-xs mt-1" style="color: var(--admin-text-muted);">Try adjusting your filters</p>
      </div>

      <!-- Pagination -->
      <div v-if="displayedRecords.length > 0" class="px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style="border-color: var(--admin-border);">
        <p class="text-xs" style="color: var(--admin-text-secondary);">
          Showing {{ displayedRecords.length }} of {{ totalRecords }} records
          <span v-if="lastPage > 1" class="ml-1"> &mdash; Page {{ currentPage }} of {{ lastPage }}</span>
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage <= 1"
            @click="fetchAttendance(currentPage - 1)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
            style="border: 1px solid var(--admin-border); color: var(--admin-text-secondary);"
          >
            Prev
          </button>
          <button
            :disabled="currentPage >= lastPage"
            @click="fetchAttendance(currentPage + 1)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
            style="border: 1px solid var(--admin-border); color: var(--admin-text-secondary);"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Details slide-over -->
    <Teleport to="body">
      <div
        v-if="isDetailsOpen"
        class="fixed inset-0 z-50 flex justify-end"
        @click.self="closeDetails"
      >
        <div class="absolute inset-0 backdrop-blur-sm" style="background: rgba(0,0,0,0.3);" @click="closeDetails"></div>

        <div
          v-if="selectedRecord"
          class="relative w-[420px] max-w-full h-full shadow-2xl flex flex-col"
          style="background: var(--admin-card); box-shadow: var(--admin-shadow);"
        >
          <!-- Panel header -->
          <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: var(--admin-border);">
            <h2 class="text-base font-semibold" style="color: var(--admin-text);">Attendance Details</h2>
            <button
              @click="closeDetails"
              class="p-2 rounded-lg transition-colors"
              style="color: var(--admin-text-muted);"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Panel body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Employee info -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style="background: var(--admin-accent-muted);">
                <span class="text-sm font-semibold" style="color: var(--admin-accent);">{{ getInitials(selectedRecord.employee_name) }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ selectedRecord.employee_name }}</p>
                <p class="text-xs" style="color: var(--admin-text-secondary);">Employee</p>
              </div>
              <div class="ml-auto">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                  :style="{ color: statusColor(selectedRecord.status), background: statusBg(selectedRecord.status) }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :style="{ background: statusDotColor(selectedRecord.status) }"></span>
                  {{ statusConfig(selectedRecord.status).label }}
                </span>
              </div>
            </div>

            <!-- Details grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Date</p>
                <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ formatDate(selectedRecord.clock_in) }}</p>
              </div>
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Total Hours</p>
                <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ formatHours(selectedRecord.total_hours) }}</p>
              </div>
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock In</p>
                <p class="text-sm font-semibold font-mono" style="color: var(--admin-text);">{{ formatTime(selectedRecord.clock_in) }}</p>
              </div>
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock Out</p>
                <p class="text-sm font-semibold font-mono" style="color: var(--admin-text);">{{ formatTime(selectedRecord.clock_out) }}</p>
              </div>
            </div>

            <!-- Location info -->
            <div v-if="selectedRecord.lat_in || selectedRecord.long_in" class="space-y-3">
              <h3 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--admin-text-secondary);">Location</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                  <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock In Location</p>
                  <p class="text-xs font-mono" style="color: var(--admin-text-secondary);">
                    {{ selectedRecord.lat_in !== null ? selectedRecord.lat_in.toFixed(6) : '—' }},
                    {{ selectedRecord.long_in !== null ? selectedRecord.long_in.toFixed(6) : '—' }}
                  </p>
                </div>
                <div v-if="selectedRecord.lat_out || selectedRecord.long_out" class="p-4 rounded-xl" style="background: var(--admin-bg);">
                  <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock Out Location</p>
                  <p class="text-xs font-mono" style="color: var(--admin-text-secondary);">
                    {{ selectedRecord.lat_out !== null ? selectedRecord.lat_out.toFixed(6) : '—' }},
                    {{ selectedRecord.long_out !== null ? selectedRecord.long_out.toFixed(6) : '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="selectedRecord.notes" class="space-y-2">
              <h3 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--admin-text-secondary);">Notes</h3>
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-sm" style="color: var(--admin-text-secondary);">{{ selectedRecord.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Panel footer -->
          <div class="px-6 py-4 border-t" style="border-color: var(--admin-border);">
            <button
              @click="closeDetails"
              class="w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
              style="background: var(--admin-border); color: var(--admin-text-secondary);"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
  --admin-accent-muted: rgba(16, 185, 129, 0.12);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.1);
  --admin-warning: #fbbf24;
  --admin-warning-muted: rgba(251, 191, 36, 0.1);
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;
}

@keyframes admin-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

@keyframes admin-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── Table row hover ─────────────────────────────────────────── */
tbody tr:hover {
  background: var(--admin-bg);
}
</style>