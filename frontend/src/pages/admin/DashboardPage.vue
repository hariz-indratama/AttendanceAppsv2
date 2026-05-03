<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import apiClient from '@/api/axios'
import type { User, Attendance } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'

// ─── State ───────────────────────────────────────────────────────────────────

type TabName = 'overview' | 'employees' | 'activity'

const activeTab = ref<TabName>('overview')
const isLoading = ref(true)

// Overview tab
const stats = ref({
  present_today: 0,
  late_today: 0,
  absent_today: 0,
  total_hours_today: 0,
})

// Employees tab
const employees = ref<User[]>([])
const employeesPage = ref(1)
const employeesLastPage = ref(1)

// Activity tab
const todayActivity = ref<Attendance[]>([])
const activityLoading = ref(false)

let refreshInterval: ReturnType<typeof setInterval> | null = null

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchStats(), fetchEmployees()])
  isLoading.value = false
  refreshInterval = setInterval(fetchTodayActivity, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchStats(): Promise<void> {
  try {
    const res = await apiClient.get('/api/admin/dashboard/stats')
    stats.value = res.data.data
  } catch {
    // fall back to zeroed stats
  }
}

async function fetchEmployees(page = 1): Promise<void> {
  try {
    const res = await apiClient.get<PaginatedResponse<User>>('/api/admin/employees', {
      params: { per_page: 10, page },
    })
    employees.value = res.data.data
    employeesPage.value = res.data.meta.current_page
    employeesLastPage.value = res.data.meta.last_page
  } catch {
    // fall back to empty list
  }
}

async function fetchTodayActivity(): Promise<void> {
  if (activeTab.value !== 'activity') return
  activityLoading.value = true
  try {
    const res = await apiClient.get<{ data: Attendance[] }>('/api/admin/attendance/today')
    todayActivity.value = res.data.data
  } catch {
    // fall back to empty list
  } finally {
    activityLoading.value = false
  }
}

// ─── Tab switching ─────────────────────────────────────────────────────────────

function switchTab(tab: TabName): void {
  activeTab.value = tab
  if (tab === 'activity' && todayActivity.value.length === 0) {
    fetchTodayActivity()
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function statusColor(status: string): string {
  switch (status) {
    case 'present':
      return 'text-success bg-success-muted'
    case 'late':
      return 'text-warning bg-warning-muted'
    case 'absent':
      return 'text-danger bg-danger-muted'
    case 'half_day':
      return 'text-warning bg-warning-muted'
    default:
      return 'text-secondary bg-secondary'
  }
}

function formatHours(hours: number | null | undefined): string {
  if (hours == null) return '0.0'
  return hours.toFixed(1)
}

function roleBadge(role: string): string {
  return role === 'admin'
    ? 'text-accent-admin bg-accent-admin-muted'
    : 'text-accent bg-accent-muted'
}
</script>

<template>
  <div>
    <!-- Tab Navigation -->
    <div class="flex border-b mb-6">
      <button
        v-for="tab in (['overview', 'employees', 'activity'] as const)"
        :key="tab"
        @click="switchTab(tab)"
        class="px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize"
        :class="
          activeTab === tab
            ? 'border-accent-admin text-accent-admin'
            : 'border-transparent text-secondary hover:text-primary hover:border-border'
        "
      >
        {{ tab }}
      </button>
    </div>

    <!-- ── Overview Tab ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'overview'">
      <!-- Loading Skeletons -->
      <div v-if="isLoading" class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="i"
          class="admin-kpi-card animate-pulse"
        >
          <div class="h-4 bg-secondary rounded w-20 mb-3"></div>
          <div class="h-8 bg-secondary rounded w-16 mt-1"></div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div v-else class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Present Today -->
        <div class="admin-kpi-card admin-kpi-card--1">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm text-secondary">Present Today</span>
          </div>
          <p class="text-3xl font-bold text-primary">{{ stats.present_today }}</p>
        </div>

        <!-- Late Today -->
        <div class="admin-kpi-card admin-kpi-card--2">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-warning-muted flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm text-secondary">Late Today</span>
          </div>
          <p class="text-3xl font-bold text-primary">{{ stats.late_today }}</p>
        </div>

        <!-- Absent Today -->
        <div class="admin-kpi-card admin-kpi-card--3">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-danger-muted flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span class="text-sm text-secondary">Absent Today</span>
          </div>
          <p class="text-3xl font-bold text-primary">{{ stats.absent_today }}</p>
        </div>

        <!-- Total Hours Today -->
        <div class="admin-kpi-card admin-kpi-card--4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-accent-admin-muted flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-accent-admin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-sm text-secondary">Total Hours Today</span>
          </div>
          <p class="text-3xl font-bold text-primary">{{ formatHours(stats.total_hours_today) }}<span
              class="text-base font-normal text-muted ml-1">h</span></p>
        </div>
      </div>
    </div>

    <!-- ── Employees Tab ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'employees'">
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="admin-card overflow-hidden animate-pulse">
        <div class="p-4 border-b">
          <div class="h-4 bg-secondary rounded w-32"></div>
        </div>
        <div v-for="i in 5" :key="i" class="p-4 border-b flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-secondary shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-secondary rounded w-40"></div>
            <div class="h-3 bg-secondary rounded w-56"></div>
          </div>
          <div class="h-6 bg-secondary rounded w-20"></div>
        </div>
      </div>

      <!-- Employee Table -->
      <div v-else class="admin-card overflow-hidden">
        <div class="p-5 border-b flex items-center justify-between">
          <h2 class="text-base font-semibold text-primary">All Employees</h2>
          <router-link
            to="/admin/employees"
            class="text-sm text-accent-admin hover:opacity-80 font-medium"
          >
            View all
          </router-link>
        </div>

        <!-- Empty State -->
        <div v-if="employees.length === 0" class="p-10 text-center">
          <div class="w-14 h-14 rounded-2xl bg-secondary mx-auto mb-3 flex items-center justify-center">
            <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p class="text-sm text-secondary">No employees found</p>
        </div>

        <!-- Rows -->
        <div v-else class="divide-y">
          <div
            v-for="employee in employees"
            :key="employee.id"
            class="p-4 flex items-center gap-4 hover:bg-secondary transition-colors"
          >
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-accent-admin-muted flex items-center justify-center shrink-0">
              <span class="text-sm font-semibold text-accent-admin">{{ getInitials(employee.name) }}</span>
            </div>

            <!-- Name + Email -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-primary truncate">{{ employee.name }}</p>
              <p class="text-xs text-secondary truncate">{{ employee.email }}</p>
            </div>

            <!-- Role Badge -->
            <span
              class="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
              :class="roleBadge(employee.role)"
            >
              {{ employee.role }}
            </span>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="employeesLastPage > 1" class="p-4 border-t flex items-center justify-between">
          <p class="text-xs text-secondary">
            Page {{ employeesPage }} of {{ employeesLastPage }}
          </p>
          <div class="flex gap-2">
            <button
              :disabled="employeesPage <= 1"
              @click="fetchEmployees(employeesPage - 1)"
              class="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Prev
            </button>
            <button
              :disabled="employeesPage >= employeesLastPage"
              @click="fetchEmployees(employeesPage + 1)"
              class="px-3 py-1.5 text-xs font-medium border rounded-lg disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Activity Tab ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'activity'">
      <!-- Refresh indicator -->
      <div class="flex items-center gap-2 mb-4">
        <div class="h-2 w-2 rounded-full bg-success animate-pulse"></div>
        <span class="text-xs text-muted">Auto-refreshes every 30s</span>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="activityLoading && todayActivity.length === 0" class="space-y-3">
        <div v-for="i in 6" :key="i" class="admin-card p-4 animate-pulse flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-secondary shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-secondary rounded w-40"></div>
            <div class="h-3 bg-secondary rounded w-24"></div>
          </div>
          <div class="h-6 bg-secondary rounded w-20"></div>
        </div>
      </div>

      <!-- Activity List -->
      <div v-else-if="todayActivity.length > 0" class="space-y-3">
        <div
          v-for="record in todayActivity"
          :key="record.id"
          class="admin-card p-4 flex items-center gap-4"
        >
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-accent-admin-muted flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-accent-admin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <!-- Clock-in info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-primary">
              {{ record.user_id }}
            </p>
            <p class="text-xs text-secondary">
              Clock in: {{ formatTime(record.clock_in) }}
              <span v-if="record.clock_out"> — Clock out: {{ formatTime(record.clock_out) }}</span>
            </p>
          </div>

          <!-- Status Badge -->
          <span
            class="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
            :class="statusColor(record.status)"
          >
            {{ record.status }}
          </span>

          <!-- Hours -->
          <div class="text-right shrink-0">
            <p class="text-sm font-semibold text-primary">{{ formatHours(record.total_hours) }}h</p>
            <p class="text-xs text-muted">worked</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="admin-card p-10 text-center">
        <div class="w-14 h-14 rounded-2xl bg-secondary mx-auto mb-3 flex items-center justify-center">
          <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-sm text-secondary">No activity recorded today</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Animations ─────────────────────────────────────────────────────────── */

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── KPI Card ───────────────────────────────────────────────────────────── */

.admin-kpi-card {
  background: var(--color-card);
  border-radius: 1rem;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  animation: fade-up 0.4s ease-out both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* Staggered entrance delays */
.admin-kpi-card--1 { animation-delay: 0ms; }
.admin-kpi-card--2 { animation-delay: 75ms; }
.admin-kpi-card--3 { animation-delay: 150ms; }
.admin-kpi-card--4 { animation-delay: 225ms; }

/* ─── Generic Card ────────────────────────────────────────────────────────── */

.admin-card {
  background: var(--color-card);
  border-radius: 1rem;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
}
</style>