<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import apiClient from '@/api/axios'
import type { Attendance, Payroll } from '@/types/auth'

const authStore = useAuthStore()
type Tab = 'overview' | 'attendance' | 'payroll'
const activeTab = ref<Tab>('overview')

const user = computed(() => authStore.user)

const initials = computed(() => {
  const name = user.value?.name ?? 'U'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return parts.length >= 2
    ? ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase()
})

const memberSince = computed(() => {
  if (!user.value?.created_at) return 'Unknown'
  return new Date(user.value.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const isBiometricEnrolled = computed(() => false)
const biometricLabel = computed(() => isBiometricEnrolled.value ? 'Enrolled' : 'Not Enrolled')

const attendanceHistory = ref<Attendance[]>([])
const isLoadingHistory = ref(false)
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const calendarYear = ref(currentYear)
const calendarMonth = ref(currentMonth)

const calendarDays = computed(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1)
  const lastDay = new Date(calendarYear.value, calendarMonth.value + 1, 0)
  const startOffset = firstDay.getDay()
  const days: Array<{ day: number | null; record: Attendance | null }> = []
  for (let i = 0; i < startOffset; i++) {
    days.push({ day: null, record: null })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const record = attendanceHistory.value.find(r => r.clock_in && r.clock_in.startsWith(dateStr)) ?? null
    days.push({ day: d, record })
  }
  return days
})

const monthLabel = computed(() =>
  new Date(calendarYear.value, calendarMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  if (calendarMonth.value === 0) { calendarMonth.value = 11; calendarYear.value-- }
  else { calendarMonth.value-- }
}

function nextMonth() {
  if (calendarMonth.value === 11) { calendarMonth.value = 0; calendarYear.value++ }
  else { calendarMonth.value++ }
}

const hoursThisMonth = computed(() =>
  attendanceHistory.value
    .filter(r => {
      const d = new Date(r.clock_in)
      return d.getFullYear() === calendarYear.value && d.getMonth() === calendarMonth.value
    })
    .reduce((sum, r) => sum + (r.total_hours ?? 0), 0)
)

const daysWorked = computed(() =>
  attendanceHistory.value.filter(r =>
    r.clock_in && new Date(r.clock_in).getFullYear() === currentYear && new Date(r.clock_in).getMonth() === currentMonth
  ).length
)

const lateCount = computed(() =>
  attendanceHistory.value.filter(r =>
    r.status === 'late' && new Date(r.clock_in).getFullYear() === currentYear && new Date(r.clock_in).getMonth() === currentMonth
  ).length
)

const selectedDay = ref<{ day: number | null; record: Attendance | null } | null>(null)

function openDayModal(dayInfo: { day: number | null; record: Attendance | null }) {
  selectedDay.value = dayInfo
}

function closeDayModal() {
  selectedDay.value = null
}

function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const statusColorMap: Record<string, string> = {
  present: 'text-[var(--success)] bg-[var(--success-muted)]',
  late: 'text-[var(--warning)] bg-[var(--warning-muted)]',
  absent: 'text-[var(--danger)] bg-[var(--danger-muted)]',
  half_day: 'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]',
}

const payslips = ref<Payroll[]>([])
const isLoadingPayroll = ref(false)

function statusBadgeClass(status: string) {
  switch (status) {
    case 'paid': return 'text-[var(--success)] bg-[var(--success-muted)]'
    case 'pending': return 'text-[var(--warning)] bg-[var(--warning-muted)]'
    case 'approved': return 'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]'
    default: return 'text-[var(--text-muted)] bg-[var(--bg)]'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function payslipPeriod(p: Payroll): string {
  return new Date(p.year, p.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

async function fetchAttendanceHistory() {
  isLoadingHistory.value = true
  try {
    const response = await apiClient.get('/attendance/history', { params: { per_page: 100 } })
    attendanceHistory.value = response.data.data ?? []
  } catch {
    attendanceHistory.value = []
  } finally {
    isLoadingHistory.value = false
  }
}

async function fetchPayroll() {
  isLoadingPayroll.value = true
  try {
    const response = await apiClient.get('/attendance/payroll', { params: { per_page: 3 } })
    payslips.value = response.data.data ?? []
  } catch {
    payslips.value = []
  } finally {
    isLoadingPayroll.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchAttendanceHistory(), fetchPayroll()])
})
</script>

<template>
  <div class="page">
    <!-- Avatar Header -->
    <div class="avatar-card" style="animation-delay: 0ms">
      <div class="avatar-ring">
        <span class="avatar-initials">{{ initials }}</span>
      </div>
      <h2 class="avatar-name">{{ user?.name ?? '—' }}</h2>
      <p class="avatar-email">{{ user?.email ?? '—' }}</p>
      <span class="role-badge" :class="user?.role === 'admin' ? 'role-badge--admin' : 'role-badge--employee'">
        {{ user?.role === 'admin' ? 'Admin' : 'Employee' }}
      </span>
    </div>

    <!-- Tab Bar -->
    <div class="tab-bar" style="animation-delay: 80ms">
      <button
        v-for="tab in (['overview', 'attendance', 'payroll'] as Tab[])"
        :key="tab"
        @click="activeTab = tab"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab }"
      >
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
      </button>
    </div>

    <!-- ══ OVERVIEW ══ -->
    <div v-if="activeTab === 'overview'" class="tab-content">
      <!-- User Info -->
      <div class="card" style="animation-delay: 120ms">
        <h3 class="card-title">User Information</h3>
        <dl class="info-list">
          <div class="info-row">
            <dt class="info-key">Full Name</dt>
            <dd class="info-val">{{ user?.name ?? '—' }}</dd>
          </div>
          <div class="info-divider" />
          <div class="info-row">
            <dt class="info-key">Email</dt>
            <dd class="info-val">{{ user?.email ?? '—' }}</dd>
          </div>
          <div class="info-divider" />
          <div class="info-row">
            <dt class="info-key">Role</dt>
            <dd class="info-val capitalize">{{ (user?.role ?? 'employee').toLowerCase() }}</dd>
          </div>
          <div class="info-divider" />
          <div class="info-row">
            <dt class="info-key">Member Since</dt>
            <dd class="info-val">{{ memberSince }}</dd>
          </div>
        </dl>
      </div>

      <!-- Work Stats -->
      <div class="card" style="animation-delay: 160ms">
        <h3 class="card-title">Work Stats — {{ monthLabel }}</h3>
        <div v-if="isLoadingHistory" class="stats-skeleton">
          <div v-for="i in 3" :key="i" class="skel-stat" />
        </div>
        <div v-else class="stats-row">
          <div class="stat-item">
            <p class="stat-val">{{ hoursThisMonth.toFixed(1) }}</p>
            <p class="stat-lbl">Hours</p>
          </div>
          <div class="stat-item">
            <p class="stat-val">{{ daysWorked }}</p>
            <p class="stat-lbl">Days Worked</p>
          </div>
          <div class="stat-item">
            <p class="stat-val">{{ lateCount }}</p>
            <p class="stat-lbl">Late</p>
          </div>
        </div>
      </div>

      <!-- Biometric -->
      <div class="card" style="animation-delay: 200ms">
        <h3 class="card-title">Biometric Authentication</h3>
        <div class="bio-row">
          <div class="bio-icon" :class="isBiometricEnrolled ? 'bio-icon--ok' : 'bio-icon--muted'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <div class="bio-info">
            <p class="bio-name">WebAuthn</p>
            <p class="bio-sub">Fingerprint / Face ID</p>
          </div>
          <span class="bio-badge" :class="isBiometricEnrolled ? 'bio-badge--ok' : 'bio-badge--muted'">
            {{ biometricLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══ ATTENDANCE ══ -->
    <div v-if="activeTab === 'attendance'" class="tab-content">
      <!-- Month Navigator -->
      <div class="month-nav" style="animation-delay: 120ms">
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

      <!-- Calendar -->
      <div v-if="isLoadingHistory" class="card" style="animation-delay: 160ms">
        <div class="cal-skeleton">
          <div v-for="i in 35" :key="i" class="skel-cal" />
        </div>
      </div>
      <div v-else class="card cal-card" style="animation-delay: 160ms">
        <div class="cal-header">
          <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="cal-day-name">{{ d }}</span>
        </div>
        <div class="cal-grid">
          <button
            v-for="(item, idx) in calendarDays"
            :key="idx"
            @click="item.day !== null && openDayModal(item)"
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
      </div>
    </div>

    <!-- ══ PAYROLL ══ -->
    <div v-if="activeTab === 'payroll'" class="tab-content">
      <div v-if="isLoadingPayroll" class="payslip-skeleton">
        <div v-for="i in 3" :key="i" class="skel-payslip" />
      </div>

      <template v-else-if="payslips.length > 0" style="animation-delay: 120ms">
        <div v-for="payslip in payslips" :key="payslip.id" class="payslip-card">
          <div class="payslip-header">
            <p class="payslip-period">{{ payslipPeriod(payslip) }}</p>
            <span class="payslip-status" :class="statusBadgeClass(payslip.status)">
              {{ payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1) }}
            </span>
          </div>
          <p class="payslip-hours">
            {{ payslip.total_hours.toFixed(1) }}h logged
            <span v-if="payslip.overtime_hours > 0"> · {{ payslip.overtime_hours.toFixed(1) }}h OT</span>
          </p>
          <div class="payslip-grid">
            <div>
              <p class="payslip-key">Gross</p>
              <p class="payslip-val">{{ formatCurrency(payslip.gross_salary) }}</p>
            </div>
            <div>
              <p class="payslip-key">Deductions</p>
              <p class="payslip-val payslip-val--danger">-{{ formatCurrency(payslip.deductions + payslip.late_deductions) }}</p>
            </div>
            <div>
              <p class="payslip-key">Net</p>
              <p class="payslip-val payslip-val--net">{{ formatCurrency(payslip.net_salary) }}</p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="card empty-state" style="animation-delay: 120ms">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="empty-title">No payroll records</p>
        <p class="empty-sub">Payslips will appear here once processed.</p>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedDay" class="modal-overlay" @click.self="closeDayModal">
        <div class="modal">
          <div class="modal-header">
            <p class="modal-date">
              {{ new Date(calendarYear, calendarMonth, selectedDay.day ?? 1).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
            </p>
            <button @click="closeDayModal" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <template v-if="selectedDay.record">
              <div class="modal-grid">
                <div class="modal-card">
                  <p class="modal-key">Clock In</p>
                  <p class="modal-val">{{ formatTime(selectedDay.record.clock_in) }}</p>
                </div>
                <div class="modal-card">
                  <p class="modal-key">Clock Out</p>
                  <p class="modal-val">{{ formatTime(selectedDay.record.clock_out) }}</p>
                </div>
              </div>
              <div class="modal-card modal-card--wide">
                <p class="modal-key">Total Hours</p>
                <p class="modal-val modal-val--lg">{{ (selectedDay.record.total_hours ?? 0).toFixed(2) }}h</p>
              </div>
              <div>
                <p class="modal-key" style="margin-bottom: 0.5rem">Status</p>
                <span class="status-pill" :class="statusColorMap[selectedDay.record.status] ?? ''">
                  {{ selectedDay.record.status }}
                </span>
              </div>
            </template>
            <div v-else class="modal-empty">
              <p class="modal-empty-text">No attendance record for this day.</p>
            </div>
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

/* ─── Avatar Card ─────────────────────────────────────────── */
.avatar-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

.avatar-ring {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: rgba(232, 146, 12, 0.08);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.875rem;
}

.avatar-initials {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--accent);
}

.avatar-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.avatar-email {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.role-badge {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.25rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: 1px solid;
}

.role-badge--employee {
  color: var(--accent);
  border-color: rgba(232,146,12,0.3);
  background: var(--accent-muted);
}

.role-badge--admin {
  color: #a78bfa;
  border-color: rgba(167,139,250,0.3);
  background: rgba(167,139,250,0.08);
}

/* ─── Tab Bar ─────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 0.25rem;
  animation: fadeUp 300ms ease-out both;
}

.tab-btn {
  flex: 1;
  padding: 0.625rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
}

.tab-btn--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* ─── Tab Content ─────────────────────────────────────────── */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ─── Card ────────────────────────────────────────────────── */
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

.card-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* ─── Info List ───────────────────────────────────────────── */
.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
}

.info-key {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.info-val {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: right;
}

.info-divider {
  height: 1px;
  background: var(--border);
}

/* ─── Stats Row ───────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 0.5rem;
  text-align: center;
}

.stat-val {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-lbl {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

/* ─── Biometric ───────────────────────────────────────────── */
.bio-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.bio-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bio-icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.bio-icon--ok {
  background: var(--success-muted);
  color: var(--success);
}

.bio-icon--muted {
  background: var(--bg);
  color: var(--text-muted);
}

.bio-info {
  flex: 1;
}

.bio-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bio-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.bio-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.bio-badge--ok {
  color: var(--success);
  border-color: rgba(52,211,153,0.3);
  background: var(--success-muted);
}

.bio-badge--muted {
  color: var(--text-muted);
  border-color: var(--border);
  background: var(--bg);
}

/* ─── Month Nav ───────────────────────────────────────────── */
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

/* ─── Calendar ─────────────────────────────────────────────── */
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

/* ─── Payslip ─────────────────────────────────────────────── */
.payslip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  animation: fadeUp 300ms ease-out both;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3);
}

.payslip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.payslip-period {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.payslip-status {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  border: 1px solid;
  flex-shrink: 0;
}

.payslip-hours {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.875rem;
}

.payslip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.payslip-key {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.payslip-val {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.payslip-val--danger { color: var(--danger); }
.payslip-val--net {
  font-size: 1.125rem;
  font-weight: 800;
}

/* ─── Empty State ─────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  gap: 0.75rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg { width: 1.5rem; height: 1.5rem; color: var(--text-muted); }
.empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-secondary); }
.empty-sub   { font-size: 0.8125rem; color: var(--text-muted); }

/* ─── Modal ──────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 200ms ease-out;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 22rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.5rem 1.5rem 1rem 1rem;
  overflow: hidden;
  animation: slideUp 300ms cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a2540, #0f172a);
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-date {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  transition: background 150ms;
}

.modal-close svg { width: 0.875rem; height: 0.875rem; }
.modal-close:hover { background: var(--bg-card-alt); }

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.modal-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}

.modal-card--wide { grid-column: 1 / -1; }

.modal-key {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.modal-val {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text-primary);
}

.modal-val--lg {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
}

.status-pill {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.modal-empty { text-align: center; padding: 1.5rem 0; }
.modal-empty-text { font-size: 0.9375rem; color: var(--text-muted); }

/* ─── Skeletons ──────────────────────────────────────────── */
.stats-skeleton, .payslip-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.skel-stat, .skel-payslip { background: var(--border); border-radius: 0.75rem; animation: pulse 1.5s ease-in-out infinite; }
.skel-stat { height: 4.5rem; }
.skel-payslip { height: 7rem; }

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

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
</style>
