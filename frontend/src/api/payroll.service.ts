import apiClient from './axios'
import type { Payroll, PayrollItem, DeductionItem } from '@/types/payroll'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const payrollService = {
  async list(params?: {
    page?: number
    per_page?: number
    month?: number
    year?: number
    status?: string
  }): Promise<PaginatedResponse<Payroll>> {
    const response = await apiClient.get('/payroll', { params })
    return response.data
  },

  async get(id: number): Promise<ApiResponse<Payroll>> {
    const response = await apiClient.get(`/payroll/${id}`)
    return response.data
  },

  async calculate(employeeId: number, month: number, year: number): Promise<ApiResponse<{
    payroll: Payroll
    items: PayrollItem[]
    deductions: DeductionItem[]
  }>> {
    const response = await apiClient.post('/payroll/calculate', { employee_id: employeeId, month, year })
    return response.data
  },

  async approve(id: number): Promise<ApiResponse<Payroll>> {
    const response = await apiClient.post(`/payroll/${id}/approve`)
    return response.data
  },

  async getReport(params: {
    month: number
    year: number
    department_id?: number
  }): Promise<ApiResponse<Payroll[]>> {
    const response = await apiClient.get('/payroll/report', { params })
    return response.data
  },
}