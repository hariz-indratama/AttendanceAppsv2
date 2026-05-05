import { defineStore } from 'pinia'
import { ref } from 'vue'
import { payrollService } from '@/api/payroll.service'
import type { Payroll } from '@/types/payroll'

export const usePayrollStore = defineStore('payroll', () => {
  const payrolls = ref<Payroll[]>([])
  const selectedPayroll = ref<Payroll | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const filters = ref({
    month: null as number | null,
    year: null as number | null,
    status: null as string | null,
  })

  async function fetchPayrolls(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await payrollService.list({
        page,
        per_page: pagination.value.per_page,
        month: filters.value.month || undefined,
        year: filters.value.year || undefined,
        status: filters.value.status || undefined,
      })
      payrolls.value = page === 1 ? response.data : [...payrolls.value, ...response.data]
      pagination.value = response.meta
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch payroll'
    } finally {
      isLoading.value = false
    }
  }

  async function approvePayroll(id: number) {
    isLoading.value = true
    try {
      const response = await payrollService.approve(id)
      const index = payrolls.value.findIndex(p => p.id === id)
      if (index !== -1) payrolls.value[index] = response.data
      if (selectedPayroll.value?.id === id) selectedPayroll.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to approve payroll'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clear() {
    payrolls.value = []
    selectedPayroll.value = null
    pagination.value = { current_page: 1, last_page: 1, per_page: 15, total: 0 }
  }

  return {
    payrolls,
    selectedPayroll,
    isLoading,
    error,
    pagination,
    filters,
    fetchPayrolls,
    approvePayroll,
    setFilters,
    clear,
  }
})
