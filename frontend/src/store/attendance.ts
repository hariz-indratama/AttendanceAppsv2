import { defineStore } from 'pinia'
import { ref } from 'vue'
import { attendanceService } from '@/api/attendance.service'
import type { Attendance, ClockInRequest, ClockOutRequest } from '@/types/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  const todayAttendance = ref<Attendance | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function clockIn(data: ClockInRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await attendanceService.clockIn(data)
      todayAttendance.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Clock in failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function clockOut(data: ClockOutRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await attendanceService.clockOut(data)
      todayAttendance.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Clock out failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchToday() {
    isLoading.value = true
    try {
      const response = await attendanceService.getToday()
      todayAttendance.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    todayAttendance.value = null
    error.value = null
  }

  return {
    todayAttendance,
    isLoading,
    error,
    clockIn,
    clockOut,
    fetchToday,
    clear,
  }
})
