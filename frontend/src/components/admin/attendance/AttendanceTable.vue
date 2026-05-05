<script setup lang="ts">
import { computed } from 'vue'
import type { Attendance } from '@/types/attendance'

export interface AttendanceRecord extends Attendance {
  employee_name: string
}

export type SortKey = 'employee_name' | 'clock_in' | 'clock_out' | 'total_hours' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  order: SortOrder
}

const props = defineProps<{
  records: AttendanceRecord[]
  sort: SortState
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'sort', key: SortKey): void
  (e: 'view', record: AttendanceRecord): void
}>()

// ─── Formatting helpers ────────────────────────────────────────────

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function sortIcon(key: SortKey): string {
  if (props.sort.key !== key) return '↕'
  return props.sort.order === 'asc' ? '↑' : '↓'
}

// ─── Status helpers ─────────────────────────────────────────────────

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

const displayedRecords = computed<AttendanceRecord[]>(() => {
  const records = [...props.records]

  records.sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null

    switch (props.sort.key) {
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
      return props.sort.order === 'asc' ? aVal - bVal : bVal - aVal
    }

    const cmp = String(aVal).localeCompare(String(bVal))
    return props.sort.order === 'asc' ? cmp : -cmp
  })

  return records
})
</script>

<template>
  <div
    class="rounded-2xl shadow-lg border overflow-hidden"
    style="background: var(--admin-card); border-color: var(--admin-border); box-shadow: var(--admin-shadow);"
  >
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="divide-y" style="border-color: var(--admin-border);">
      <div v-for="i in 6" :key="i" class="px-6 py-4 flex items-center gap-4">
        <div class="w-9 h-9 rounded-full shrink-0 skeleton-pulse"></div>
        <div class="flex-1 grid grid-cols-5 gap-4">
          <div class="h-4 rounded skeleton-pulse"></div>
          <div class="h-4 rounded skeleton-pulse"></div>
          <div class="h-4 rounded skeleton-pulse"></div>
          <div class="h-4 rounded skeleton-pulse"></div>
          <div class="h-4 rounded skeleton-pulse"></div>
        </div>
        <div class="w-16 h-8 rounded skeleton-pulse"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="displayedRecords.length > 0" class="overflow-x-auto">
      <table class="w-full min-w-[768px]">
        <thead>
          <tr class="text-xs uppercase tracking-wider" style="background: var(--admin-bg); color: var(--admin-text-secondary);">
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'employee_name')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                Employee
                <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('employee_name') }}</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'clock_in')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                Date
                <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_in') }}</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'clock_in')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                Clock In
                <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_in') }}</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'clock_out')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                Clock Out
                <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('clock_out') }}</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'total_hours')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
                Total Hours
                <span class="text-xs font-bold" style="color: var(--admin-accent);">{{ sortIcon('total_hours') }}</span>
              </button>
            </th>
            <th class="px-6 py-3 text-left font-semibold">
              <button @click="emit('sort', 'status')" class="flex items-center gap-1.5 transition-colors" style="color: var(--admin-text-secondary);">
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
                @click="emit('view', record)"
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
  </div>
</template>

<style scoped>
.skeleton-pulse {
  background: var(--admin-border);
  animation: admin-pulse 1.5s ease-in-out infinite;
}

@keyframes admin-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

tbody tr:hover {
  background: var(--admin-bg);
}
</style>
