<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import apiClient from '@/api/axios'

const authStore = useAuthStore()

const isLoading = ref(true)
const stats = ref({
  todayHours: 0,
  weeklyHours: 0,
  monthlyHours: 0,
  totalDaysWorked: 0,
  lateCount: 0,
})
const recentAttendances = ref<Array<{
  id: number
  clock_in: string
  clock_out: string | null
  status: string
  total_hours: number | null
}>>([])

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Employee')

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
)

onMounted(async () => {
  await Promise.all([fetchStats(), fetchRecentAttendances()])
  isLoading.value = false
})

async function fetchStats() {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const response = await apiClient.get('/attendance/history?per_page=100')
    const attendances = response.data.data

    let monthlyHours = 0
    let weeklyHours = 0
    let totalDaysWorked = 0
    let lateCount = 0
    let todayHours = 0

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    attendances.forEach((att: { clock_in: string; clock_out: string | null; status: string; total_hours: number | null }) => {
      const clockInDate = new Date(att.clock_in)

      if (clockInDate.getMonth() + 1 === month && clockInDate.getFullYear() === year) {
        monthlyHours += att.total_hours || 0
      }

      if (clockInDate >= startOfWeek) {
        weeklyHours += att.total_hours || 0
      }

      const attDate = new Date(clockInDate)
      attDate.setHours(0, 0, 0, 0)
      if (attDate.getTime() === today.getTime()) {
        todayHours += att.total_hours || 0
      }

      if (att.clock_out) totalDaysWorked++

      if (att.status === 'late') lateCount++
    })

    stats.value = {
      todayHours: Math.round(todayHours * 10) / 10,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      totalDaysWorked,
      lateCount,
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

async function fetchRecentAttendances() {
  try {
    const response = await apiClient.get('/attendance/history?per_page=7')
    recentAttendances.value = response.data.data
  } catch {
    recentAttendances.value = []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusColor = (status: string) => ({
  'text-[var(--success)]': status === 'present',
  'text-[var(--warning)]': status === 'late',
  'text-[var(--danger)]': status === 'absent',
})
</script>

<template>
  <div class="page">
    <!-- Greeting Card -->
    <div class="greeting-card">
      <div class="greeting-glow" aria-hidden="true" />
      <h1 class="greeting-title">{{ greeting }}, {{ firstName }}</h1>
      <p class="greeting-date">{{ currentDate }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="stat-value">{{ stats.todayHours }}<span class="stat-unit">h</span></p>
        <p class="stat-label">Today</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="stat-value">{{ stats.weeklyHours }}<span class="stat-unit">h</span></p>
        <p class="stat-label">This Week</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="stat-value">{{ stats.monthlyHours }}<span class="stat-unit">h</span></p>
        <p class="stat-label">This Month</p>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="stat-value">{{ stats.totalDaysWorked }}<span class="stat-unit">days</span></p>
        <p class="stat-label">Days Worked</p>
      </div>
    </div>

    <!-- Late Alert -->
    <transition name="alert-slide">
      <div v-if="!isLoading && stats.lateCount > 0" class="late-alert">
        <div class="late-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="late-title">Late Arrivals</p>
          <p class="late-sub">You have been late {{ stats.lateCount }} time{{ stats.lateCount > 1 ? 's' : '' }} this month</p>
        </div>
      </div>
    </transition>

    <!-- Recent Activity -->
    <div class="card">
      <h2 class="section-title">Recent Activity</h2>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="activity-list">
        <div v-for="i in 4" :key="i" class="activity-skeleton">
          <div class="skel-circle" />
          <div class="skel-lines">
            <div class="skel-line skel-line--wide" />
            <div class="skel-line skel-line--narrow" />
          </div>
          <div class="skel-badge" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="recentAttendances.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="empty-text">No attendance records yet</p>
      </div>

      <!-- Activity List -->
      <div v-else class="activity-list">
        <div
          v-for="(att, idx) in recentAttendances"
          :key="att.id"
          class="activity-item"
          :style="{ animationDelay: `${idx * 50}ms` }"
        >
          <div class="activity-dot" :class="`activity-dot--${att.status}`" />

          <div class="activity-info">
            <p class="activity-date">{{ formatDate(att.clock_in) }}</p>
            <p class="activity-time">
              {{ formatTime(att.clock_in) }}
              <span v-if="att.clock_out"> — {{ formatTime(att.clock_out) }}</span>
            </p>
          </div>

          <div class="activity-right">
            <p class="activity-hours">{{ att.total_hours?.toFixed(1) || '0.0' }}<span class="activity-unit">h</span></p>
            <p class="activity-status" :class="`activity-status--${att.status}`">{{ att.status }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles consume global CSS tokens from main.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
  font-family: var(--font-body);
}

/* ─── Greeting Card ──────────────────────────────────────── */
.greeting-card {
  position: relative;
  background: linear-gradient(135deg, #1a2540 0%, #0f172a 60%);
  border: 1px solid rgba(232, 146, 12, 0.12);
  border-radius: 1.25rem;
  padding: 1.5rem 1.5rem;
  overflow: hidden;
  animation: fadeUp 400ms ease-out;
}

.greeting-glow {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 10rem;
  background: radial-gradient(ellipse, rgba(232, 146, 12, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.greeting-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  line-height: 1.2;
  position: relative;
}

.greeting-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  position: relative;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Stats Grid ─────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  animation: fadeUp 400ms 80ms ease-out both;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.125rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3);
}

.stat-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.stat-icon svg {
  width: 1rem;
  height: 1rem;
}

.stat-icon--amber {
  background: rgba(232, 146, 12, 0.1);
  color: var(--accent);
}

.stat-icon--green {
  background: var(--success-muted);
  color: var(--success);
}

.stat-icon--purple {
  background: rgba(167, 139, 250, 0.1);
  color: #a78bfa;
}

.stat-icon--blue {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-unit {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 0.125rem;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ─── Late Alert ──────────────────────────────────────────── */
.late-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--warning-muted);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
  padding: 0.875rem 1rem;
  animation: fadeUp 300ms ease-out;
}

.late-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: rgba(251, 191, 36, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.late-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--warning);
}

.late-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--warning);
}

.late-sub {
  font-size: 0.75rem;
  color: rgba(251, 191, 36, 0.7);
  margin-top: 0.125rem;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.alert-slide-enter-from { opacity: 0; transform: translateY(-8px); }
.alert-slide-leave-to  { opacity: 0; }

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
  animation: fadeUp 400ms 160ms ease-out both;
}

.section-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* ─── Activity List ───────────────────────────────────────── */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeUp 300ms ease-out both;
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-dot--present { background: var(--success); }
.activity-dot--late    { background: var(--warning); }
.activity-dot--absent  { background: var(--danger); }

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-date {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.activity-time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.activity-right {
  text-align: right;
  flex-shrink: 0;
}

.activity-hours {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}

.activity-unit {
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--text-muted);
}

.activity-status {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 0.125rem;
}

.activity-status--present { color: var(--success); }
.activity-status--late    { color: var(--warning); }
.activity-status--absent  { color: var(--danger); }

/* ─── Skeleton ────────────────────────────────────────────── */
.activity-skeleton {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.skel-circle {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--border);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skel-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.skel-line {
  height: 0.625rem;
  border-radius: 0.25rem;
  background: var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}

.skel-line--wide { width: 70%; }
.skel-line--narrow { width: 40%; }

.skel-badge {
  width: 3rem;
  height: 1.25rem;
  border-radius: 1rem;
  background: var(--border);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

/* ─── Empty State ─────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
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

.empty-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-muted);
}

.empty-text {
  font-size: 0.9375rem;
  color: var(--text-muted);
}
</style>
