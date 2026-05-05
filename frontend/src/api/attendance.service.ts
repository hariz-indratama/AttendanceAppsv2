import apiClient from './axios'
import type { Attendance, ClockInRequest, ClockOutRequest, AttendanceSummary } from '@/types/attendance'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const attendanceService = {
  async clockIn(data: ClockInRequest): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.post('/attendance/clock-in', data)
    return response.data
  },

  async clockOut(data: ClockOutRequest): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.post('/attendance/clock-out', data)
    return response.data
  },

  async getToday(): Promise<ApiResponse<Attendance | null>> {
    const response = await apiClient.get('/attendance/today')
    return response.data
  },

  async getHistory(params: {
    page?: number
    per_page?: number
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<Attendance>> {
    const response = await apiClient.get('/attendance/history', { params })
    return response.data
  },

  async getSummary(params: {
    start_date: string
    end_date: string
  }): Promise<ApiResponse<AttendanceSummary>> {
    const response = await apiClient.get('/attendance/summary', { params })
    return response.data
  },
}