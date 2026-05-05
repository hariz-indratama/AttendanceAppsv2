<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/api/axios'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'
import SalarySetupTable from '@/components/admin/payroll/SalarySetupTable.vue'
import PayrollPeriodSelector from '@/components/admin/payroll/PayrollPeriodSelector.vue'
import PayrollPreviewTable from '@/components/admin/payroll/PayrollPreviewTable.vue'
import type { PayrollPreviewEntry } from '@/components/admin/payroll/PayrollPreviewTable.vue'
import PayrollExportSection from '@/components/admin/payroll/PayrollExportSection.vue'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthOption {
  value: number
  label: string
}

// ─── State: Salary Setup ──────────────────────────────────────────────────────

const employees = ref<User[]>([])
const isLoadingEmployees = ref(true)
const editingId = ref<number | null>(null)
const editingRate = ref<string>('')
const isSavingRate = ref<number | null>(null)

// ─── State: Process Payroll ────────────────────────────────────────────────────

const MONTHS: MonthOption[] = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

const selectedMonth = ref<number>(currentMonth)
const selectedYear = ref<number>(currentYear)
const isGenerating = ref(false)
const preview = ref<PayrollPreviewEntry[]>([])
const hasGenerated = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────

const sortedEmployees = computed<User[]>(() =>
  [...employees.value].sort((a, b) => a.name.localeCompare(b.name))
)

const generateParams = computed<{ month: number; year: number }>(() => ({
  month: selectedMonth.value,
  year: selectedYear.value,
}))

const yearOptions = computed<number[]>(() => {
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y)
  }
  return years
})

const currentMonthLabel = MONTHS.find((m) => m.value === selectedMonth.value)?.label ?? ''

// ─── Salary Setup: Inline Edit ─────────────────────────────────────────────────

function startEditRate(employee: User): void {
  editingId.value = employee.id
  editingRate.value = employee.hourly_rate !== null ? String(employee.hourly_rate) : ''
}

function cancelEditRate(): void {
  editingId.value = null
  editingRate.value = ''
}

async function saveRate(employee: User): Promise<void> {
  const parsed = parseFloat(editingRate.value)
  if (isNaN(parsed) || parsed < 0) return

  isSavingRate.value = employee.id

  // Optimistic update
  const originalRate = employee.hourly_rate
  employee.hourly_rate = parsed

  try {
    await apiClient.put(`/admin/employees/${employee.id}`, {
      hourly_rate: parsed,
    })
    editingId.value = null
    editingRate.value = ''
  } catch {
    // Revert on failure
    employee.hourly_rate = originalRate
  } finally {
    isSavingRate.value = null
  }
}

function onRateKeydown(event: KeyboardEvent, employee: User): void {
  if (event.key === 'Enter') {
    saveRate(employee)
  } else if (event.key === 'Escape') {
    cancelEditRate()
  }
}

function onEditingRateInput(value: string): void {
  editingRate.value = value
}

// ─── Salary Setup: Data Fetching ──────────────────────────────────────────────

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

// ─── Payroll Generation ────────────────────────────────────────────────────────

async function generatePayroll(): Promise<void> {
  isGenerating.value = true
  preview.value = []
  hasGenerated.value = false

  try {
    const res = await apiClient.post<{ data: PayrollPreviewEntry[] }>(
      '/admin/payroll/generate',
      generateParams.value
    )
    preview.value = res.data.data ?? []
    hasGenerated.value = true
  } catch {
    preview.value = []
    hasGenerated.value = true
  } finally {
    isGenerating.value = false
  }
}

// ─── Export ────────────────────────────────────────────────────────────────────

async function downloadExport(format: 'xlsx' | 'pdf'): Promise<void> {
  const endpoint =
    format === 'xlsx'
      ? '/admin/payroll/export/xlsx'
      : '/admin/payroll/export/pdf'
  const filename =
    format === 'xlsx'
      ? `payroll-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}.xlsx`
      : `payroll-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}.pdf`

  try {
    const res = await apiClient.get(endpoint, {
      params: generateParams.value,
      responseType: 'blob',
    })

    const blob = new Blob([res.data], {
      type: res.headers['content-type'] as string,
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    // Silently fail — export failure is non-blocking
  }
}

// ─── Event Handlers ─────────────────────────────────────────────────────────────

function onUpdateSelectedMonth(value: number): void {
  selectedMonth.value = value
}

function onUpdateSelectedYear(value: number): void {
  selectedYear.value = value
}

function onGenerate(): void {
  generatePayroll()
}

function onDownloadExport(format: 'xlsx' | 'pdf'): void {
  downloadExport(format)
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchEmployees()
})
</script>

<template>
  <div class="page">
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-primary">Payroll</h1>
      <p class="text-sm text-secondary mt-1">Manage employee salaries, generate payroll, and export reports</p>
    </div>

    <!-- ─── SECTION 1: Salary Setup ──────────────────────────────────────────── -->
    <div class="card p-6 mb-6">
      <h2 class="section-title mb-4">Salary Setup</h2>
      <SalarySetupTable
        :employees="sortedEmployees"
        :isLoading="isLoadingEmployees"
        :editingId="editingId"
        :editingRate="editingRate"
        :isSavingRate="isSavingRate"
        @start-edit="startEditRate"
        @cancel-edit="cancelEditRate"
        @save-rate="saveRate"
        @rate-keydown="onRateKeydown"
        @update:editingRate="onEditingRateInput"
      />
    </div>

    <!-- ─── SECTION 2: Process Payroll ────────────────────────────────────────── -->
    <div class="card p-6 mb-6">
      <h2 class="section-title mb-4">Process Payroll</h2>

      <PayrollPeriodSelector
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        :yearOptions="yearOptions"
        :isGenerating="isGenerating"
        @update:selectedMonth="onUpdateSelectedMonth"
        @update:selectedYear="onUpdateSelectedYear"
        @generate="onGenerate"
      />

      <PayrollPreviewTable
        :preview="preview"
        :isGenerating="isGenerating"
        :hasGenerated="hasGenerated"
        class="mt-6"
      />
    </div>

    <!-- ─── SECTION 3: Export ────────────────────────────────────────────────── -->
    <div class="card p-6">
      <h2 class="section-title mb-4">Export</h2>
      <PayrollExportSection
        :monthLabel="currentMonthLabel"
        :selectedYear="selectedYear"
        :selectedMonth="selectedMonth"
        @download-export="onDownloadExport"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;

  background: var(--admin-bg);
  color: var(--admin-text);
}

/* ─── Color & style classes ──────────────────────────────────── */
.text-primary   { color: var(--admin-text); }
.text-secondary { color: var(--admin-text-secondary); }

/* ─── Card ──────────────────────────────────────────────────── */
.card {
  background: var(--admin-card);
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--admin-border);
}

/* ─── Section title ────────────────────────────────────────── */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--admin-text);
}
</style>
