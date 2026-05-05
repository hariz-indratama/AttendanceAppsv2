<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import apiClient from '@/api/axios'
import type { Attendance } from '@/types/attendance'
import type { Payroll } from '@/types/payroll'

import ProfileHeader from '@/components/employee/profile/ProfileHeader.vue'
import ProfileTabs from '@/components/employee/profile/ProfileTabs.vue'
import ProfileOverview from '@/components/employee/profile/ProfileOverview.vue'
import ProfileAttendance from '@/components/employee/profile/ProfileAttendance.vue'
import ProfilePayroll from '@/components/employee/profile/ProfilePayroll.vue'
import DayDetailModal from '@/components/employee/profile/DayDetailModal.vue'

const authStore = useAuthStore()

type Tab = 'overview' | 'attendance' | 'payroll'
const activeTab = ref<Tab>('overview')

const user = computed(() => authStore.user)

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()
const calendarYear = ref(currentYear)
const calendarMonth = ref(currentMonth)

const attendanceHistory = ref<Attendance[]>([])
const isLoadingHistory = ref(false)

const payslips = ref<Payroll[]>([])
const isLoadingPayroll = ref(false)

const monthLabel = computed(() =>
  new Date(calendarYear.value, calendarMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

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

function prevMonth() {
  if (calendarMonth.value === 0) { calendarMonth.value = 11; calendarYear.value-- }
  else { calendarMonth.value-- }
}

function nextMonth() {
  if (calendarMonth.value === 11) { calendarMonth.value = 0; calendarYear.value++ }
  else { calendarMonth.value++ }
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
    <ProfileHeader v-if="user" :user="user" />

    <ProfileTabs v-model:activeTab="activeTab" />

    <ProfileOverview
      v-if="activeTab === 'overview' && user"
      :user="user"
      :hoursThisMonth="hoursThisMonth"
      :daysWorked="daysWorked"
      :lateCount="lateCount"
      :isLoadingStats="isLoadingHistory"
      :monthLabel="monthLabel"
    />

    <ProfileAttendance
      v-if="activeTab === 'attendance'"
      :attendanceHistory="attendanceHistory"
      :calendarYear="calendarYear"
      :calendarMonth="calendarMonth"
      :isLoadingHistory="isLoadingHistory"
      :monthLabel="monthLabel"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @select-day="openDayModal"
    />

    <ProfilePayroll
      v-if="activeTab === 'payroll'"
      :payslips="payslips"
      :isLoading="isLoadingPayroll"
    />

    <DayDetailModal
      :selectedDay="selectedDay"
      :calendarYear="calendarYear"
      :calendarMonth="calendarMonth"
      @close="closeDayModal"
    />
  </div>
</template>

<style scoped>
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
</style>
