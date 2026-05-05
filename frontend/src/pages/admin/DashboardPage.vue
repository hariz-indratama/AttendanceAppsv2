<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import apiClient from '@/api/axios'
import { CheckCircle, Clock, XCircle, Timer } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'

// ─── State ───────────────────────────────────────────────────────────────────

const activeTab = ref('overview')
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
const todayActivity = ref<Array<{
  id: number
  user_id: number
  user_name: string
  clock_in: string
  clock_out: string | null
  status: string
  total_hours: number | null
}>>([])
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
    const res = await apiClient.get('/admin/dashboard/stats')
    stats.value = res.data.data
  } catch {
    // fall back to zeroed stats
  }
}

async function fetchEmployees(page = 1): Promise<void> {
  try {
    const res = await apiClient.get<PaginatedResponse<User>>('/admin/employees', {
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
    const res = await apiClient.get<{ data: Array<{
      id: number
      user_id: number
      user_name: string
      clock_in: string
      clock_out: string | null
      status: string
      total_hours: number | null
    }> }>('/admin/dashboard/today-activity')
    todayActivity.value = res.data.data
  } catch {
    // fall back to empty list
  } finally {
    activityLoading.value = false
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

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'present':
      return 'default'
    case 'late':
    case 'half_day':
      return 'secondary'
    case 'absent':
      return 'destructive'
    default:
      return 'outline'
  }
}

function formatHours(hours: number | null | undefined): string {
  if (hours == null) return '0.0'
  return hours.toFixed(1)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tab Navigation with Shadcn Tabs -->
    <Tabs v-model:value="activeTab" @update:value="(val: string) => { activeTab = val; if (val === 'activity') fetchTodayActivity() }">
      <TabsList class="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <!-- ── Overview Tab ──────────────────────────────────────────────── -->
      <TabsContent value="overview" class="mt-6 space-y-4">
        <!-- Loading Skeletons -->
        <div v-if="isLoading" class="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card v-for="i in 4" :key="i" class="p-6">
            <div class="flex flex-col gap-3">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-8 w-16" />
            </div>
          </Card>
        </div>

        <!-- KPI Cards with Shadcn Card -->
        <div v-else class="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Present Today -->
          <Card class="p-6 transition-all hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style="animation-delay: 0ms">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
              <div class="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle class="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ stats.present_today }}</div>
            </CardContent>
          </Card>

          <!-- Late Today -->
          <Card class="p-6 transition-all hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style="animation-delay: 75ms">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Late Today</CardTitle>
              <div class="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock class="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ stats.late_today }}</div>
            </CardContent>
          </Card>

          <!-- Absent Today -->
          <Card class="p-6 transition-all hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style="animation-delay: 150ms">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
              <div class="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle class="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ stats.absent_today }}</div>
            </CardContent>
          </Card>

          <!-- Total Hours Today -->
          <Card class="p-6 transition-all hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style="animation-delay: 225ms">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
              <div class="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Timer class="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{{ formatHours(stats.total_hours_today) }}<span class="text-sm font-normal text-muted-foreground ml-1">h</span></div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- ── Employees Tab ──────────────────────────────────────────────── -->
      <TabsContent value="employees" class="mt-6 space-y-4">
        <!-- Loading Skeleton -->
        <Card v-if="isLoading" class="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="i in 5" :key="i">
                <TableCell><div class="flex items-center gap-3"><Skeleton class="h-10 w-10 rounded-full" /><Skeleton class="h-4 w-32" /></div></TableCell>
                <TableCell><Skeleton class="h-4 w-40" /></TableCell>
                <TableCell><Skeleton class="h-6 w-16" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <!-- Employee Table with Shadcn -->
        <Card v-else>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>All Employees</CardTitle>
            <router-link to="/admin/employees" class="text-sm font-medium text-primary hover:underline">View all</router-link>
          </CardHeader>
          <CardContent class="p-0">
            <!-- Empty State -->
            <div v-if="employees.length === 0" class="p-10 text-center">
              <p class="text-sm text-muted-foreground">No employees found</p>
            </div>

            <!-- Table -->
            <Table v-else>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="employee in employees" :key="employee.id">
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Avatar class="h-10 w-10">
                        <AvatarFallback class="bg-emerald-500/10 text-emerald-500 text-sm font-semibold">
                          {{ getInitials(employee.name) }}
                        </AvatarFallback>
                      </Avatar>
                      <span class="text-sm font-medium">{{ employee.name }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-muted-foreground">{{ employee.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="employee.role === 'admin' ? 'default' : 'secondary'" class="capitalize">
                      {{ employee.role }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Pagination -->
            <div v-if="employeesLastPage > 1" class="flex items-center justify-between px-6 py-4 border-t">
              <p class="text-sm text-muted-foreground">Page {{ employeesPage }} of {{ employeesLastPage }}</p>
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
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ── Activity Tab ──────────────────────────────────────────────── -->
      <TabsContent value="activity" class="mt-6 space-y-4">
        <!-- Refresh indicator -->
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs text-muted-foreground">Auto-refreshes every 30s</span>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="activityLoading && todayActivity.length === 0" class="space-y-3">
          <Card v-for="i in 6" :key="i" class="p-4">
            <div class="flex items-center gap-4">
              <Skeleton class="h-10 w-10 rounded-full" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-40" />
                <Skeleton class="h-3 w-24" />
              </div>
              <Skeleton class="h-6 w-16" />
            </div>
          </Card>
        </div>

        <!-- Activity Cards -->
        <div v-else-if="todayActivity.length > 0" class="space-y-3">
          <Card v-for="record in todayActivity" :key="record.id" class="p-4">
            <div class="flex items-center gap-4">
              <Avatar class="h-10 w-10">
                <AvatarFallback class="bg-emerald-500/10 text-emerald-500">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold">{{ record.user_name }}</p>
                <p class="text-xs text-muted-foreground">
                  Clock in: {{ formatTime(record.clock_in) }}
                  <span v-if="record.clock_out"> — Clock out: {{ formatTime(record.clock_out) }}</span>
                </p>
              </div>
              <Badge :variant="getStatusVariant(record.status)" class="capitalize">{{ record.status }}</Badge>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold">{{ formatHours(record.total_hours) }}h</p>
                <p class="text-xs text-muted-foreground">worked</p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Empty State -->
        <Card v-else class="p-10 text-center">
          <p class="text-sm text-muted-foreground">No activity recorded today</p>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>