<script setup lang="ts">
import type { AttendanceRecord } from './AttendanceTable.vue'

const props = defineProps<{
  record: AttendanceRecord | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex justify-end"
      @click.self="emit('close')"
    >
      <div class="absolute inset-0 backdrop-blur-sm" style="background: rgba(0,0,0,0.3);" @click="emit('close')"></div>

      <div
        v-if="record"
        class="relative w-[420px] max-w-full h-full shadow-2xl flex flex-col"
        style="background: var(--admin-card); box-shadow: var(--admin-shadow);"
      >
        <!-- Panel header -->
        <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: var(--admin-border);">
          <h2 class="text-base font-semibold" style="color: var(--admin-text);">Attendance Details</h2>
          <button
            @click="emit('close')"
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
              <span class="text-sm font-semibold" style="color: var(--admin-accent);">{{ getInitials(record.employee_name) }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ record.employee_name }}</p>
              <p class="text-xs" style="color: var(--admin-text-secondary);">Employee</p>
            </div>
            <div class="ml-auto">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                :style="{ color: statusColor(record.status), background: statusBg(record.status) }"
              >
                <span class="w-1.5 h-1.5 rounded-full" :style="{ background: statusDotColor(record.status) }"></span>
                {{ statusConfig(record.status).label }}
              </span>
            </div>
          </div>

          <!-- Details grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
              <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Date</p>
              <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ formatDate(record.clock_in) }}</p>
            </div>
            <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
              <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Total Hours</p>
              <p class="text-sm font-semibold" style="color: var(--admin-text);">{{ formatHours(record.total_hours) }}</p>
            </div>
            <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
              <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock In</p>
              <p class="text-sm font-semibold font-mono" style="color: var(--admin-text);">{{ formatTime(record.clock_in) }}</p>
            </div>
            <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
              <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock Out</p>
              <p class="text-sm font-semibold font-mono" style="color: var(--admin-text);">{{ formatTime(record.clock_out) }}</p>
            </div>
          </div>

          <!-- Location info -->
          <div v-if="record.lat_in || record.long_in" class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--admin-text-secondary);">Location</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock In Location</p>
                <p class="text-xs font-mono" style="color: var(--admin-text-secondary);">
                  {{ record.lat_in !== null ? record.lat_in.toFixed(6) : '—' }},
                  {{ record.long_in !== null ? record.long_in.toFixed(6) : '—' }}
                </p>
              </div>
              <div v-if="record.lat_out || record.long_out" class="p-4 rounded-xl" style="background: var(--admin-bg);">
                <p class="text-xs font-medium uppercase tracking-wider mb-1" style="color: var(--admin-text-secondary);">Clock Out Location</p>
                <p class="text-xs font-mono" style="color: var(--admin-text-secondary);">
                  {{ record.lat_out !== null ? record.lat_out.toFixed(6) : '—' }},
                  {{ record.long_out !== null ? record.long_out.toFixed(6) : '—' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="record.notes" class="space-y-2">
            <h3 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--admin-text-secondary);">Notes</h3>
            <div class="p-4 rounded-xl" style="background: var(--admin-bg);">
              <p class="text-sm" style="color: var(--admin-text-secondary);">{{ record.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Panel footer -->
        <div class="px-6 py-4 border-t" style="border-color: var(--admin-border);">
          <button
            @click="emit('close')"
            class="w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
            style="background: var(--admin-border); color: var(--admin-text-secondary);"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
