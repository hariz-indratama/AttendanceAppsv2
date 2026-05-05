import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { employeesService } from '@/api/employees.service'
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const selectedEmployee = ref<Employee | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const filters = ref({
    search: '',
    department_id: null as number | null,
  })

  const hasMore = computed(() => pagination.value.current_page < pagination.value.last_page)

  async function fetchEmployees(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await employeesService.list({
        page,
        per_page: pagination.value.per_page,
        search: filters.value.search || undefined,
        department_id: filters.value.department_id || undefined,
      })
      employees.value = page === 1 ? response.data : [...employees.value, ...response.data]
      pagination.value = response.meta
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch employees'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEmployee(id: number) {
    isLoading.value = true
    try {
      const response = await employeesService.get(id)
      selectedEmployee.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(data: CreateEmployee) {
    isLoading.value = true
    try {
      const response = await employeesService.create(data)
      employees.value.unshift(response.data)
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to create employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateEmployee(id: number, data: UpdateEmployee) {
    isLoading.value = true
    try {
      const response = await employeesService.update(id, data)
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) employees.value[index] = response.data
      if (selectedEmployee.value?.id === id) selectedEmployee.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to update employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEmployee(id: number) {
    isLoading.value = true
    try {
      await employeesService.delete(id)
      employees.value = employees.value.filter(e => e.id !== id)
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to delete employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clear() {
    employees.value = []
    selectedEmployee.value = null
    pagination.value = { current_page: 1, last_page: 1, per_page: 15, total: 0 }
    filters.value = { search: '', department_id: null }
  }

  return {
    employees,
    selectedEmployee,
    isLoading,
    error,
    pagination,
    filters,
    hasMore,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setFilters,
    clear,
  }
})
