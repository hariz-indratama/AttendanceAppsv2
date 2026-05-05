import apiClient from './axios'
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const employeesService = {
  async list(params?: {
    page?: number
    per_page?: number
    search?: string
    department_id?: number
  }): Promise<PaginatedResponse<Employee>> {
    const response = await apiClient.get('/employees', { params })
    return response.data
  },

  async get(id: number): Promise<ApiResponse<Employee>> {
    const response = await apiClient.get(`/employees/${id}`)
    return response.data
  },

  async create(data: CreateEmployee): Promise<ApiResponse<Employee>> {
    const response = await apiClient.post('/employees', data)
    return response.data
  },

  async update(id: number, data: UpdateEmployee): Promise<ApiResponse<Employee>> {
    const response = await apiClient.put(`/employees/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/employees/${id}`)
  },

  async search(query: string): Promise<ApiResponse<Employee[]>> {
    const response = await apiClient.get('/employees/search', { params: { q: query } })
    return response.data
  },
}