<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'

export interface AttendanceFiltersState {
  startDate: string
  endDate: string
  status: string
  userId: string
}

const props = defineProps<{
  modelValue: AttendanceFiltersState
  isLoadingEmployees?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AttendanceFiltersState): void
  (e: 'apply'): void
  (e: 'clear'): void
}>()

const employees = ref<User[]>([])
const isLoadingEmployees = ref(false)

function formatDateForInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function updateFilter<K extends keyof AttendanceFiltersState>(key: K, value: AttendanceFiltersState[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

async function fetchEmployees(): Promise<void> {
  isLoadingEmployees.value = true
  try {
    const res = await apiClient.get<PaginatedResponse<User>>('/admin/employees', {
      params: { per_page: 100 },
    })
    employees.value = res.data.data
  } catch {
    employees.value = []
  } finally {
    isLoadingEmployees.value = false
  }
}

function handleClear(): void {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  emit('update:modelValue', {
    startDate: formatDateForInput(firstOfMonth),
    endDate: formatDateForInput(today),
    status: '',
    userId: '',
  })
  emit('clear')
}

onMounted(() => {
  fetchEmployees()
})
</script>

<template>
  <div
    class="rounded-2xl shadow-lg border mb-6"
    style="background: var(--admin-card); border-color: var(--admin-border); box-shadow: var(--admin-shadow); padding: 1rem;"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- From date -->
      <div>
        <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">From Date</label>
        <input
          :value="modelValue.startDate"
          @input="updateFilter('startDate', ($event.target as HTMLInputElement).value)"
          @change="emit('apply')"
          type="date"
          class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
          style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
        />
      </div>

      <!-- To date -->
      <div>
        <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">To Date</label>
        <input
          :value="modelValue.endDate"
          @input="updateFilter('endDate', ($event.target as HTMLInputElement).value)"
          @change="emit('apply')"
          type="date"
          class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
          style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
        />
      </div>

      <!-- Status filter -->
      <div>
        <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">Status</label>
        <select
          :value="modelValue.status"
          @change="updateFilter('status', ($event.target as HTMLSelectElement).value); emit('apply')"
          class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
          style="background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); outline: none;"
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="half_day">Half Day</option>
        </select>
      </div>

      <!-- Employee filter -->
      <div>
        <label class="block text-xs font-medium uppercase tracking-wider mb-1.5" style="color: var(--admin-text-secondary);">Employee</label>
        <select
          :value="modelValue.userId"
          @change="updateFilter('userId', ($event.target as HTMLSelectElement).value); emit('apply')"
          :disabled="isLoadingEmployees"
          class="w-full px-4 py-2.5 text-sm rounded-xl transition-colors appearance-none"
          :style="{
            background: 'var(--admin-bg)',
            border: '1px solid var(--admin-border)',
            color: 'var(--admin-text)',
            outline: 'none',
            opacity: isLoadingEmployees ? '0.5' : '1'
          }"
        >
          <option value="">All Employees</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Clear filters -->
    <div class="mt-3 flex justify-end">
      <button
        @click="handleClear"
        class="text-xs font-medium transition-colors"
        style="color: var(--admin-text-secondary);"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>
