<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/api/axios'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayrollPreviewEntry {
  user_id: number
  name: string
  hours_worked: number
  hourly_rate: number
  gross: number
  bonuses: number
  deductions: number
  net: number
}

// ─── State: Salary Setup ──────────────────────────────────────────────────────

const employees = ref<User[]>([])
const isLoadingEmployees = ref(true)
const editingId = ref<number | null>(null)
const editingRate = ref<string>('')
const isSavingRate = ref<number | null>(null)

// ─── State: Process Payroll ───────────────────────────────────────────────────

interface MonthOption {
  value: number
  label: string
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

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

      <!-- Skeleton -->
      <div v-if="isLoadingEmployees" class="space-y-3">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4">
          <div class="w-9 h-9 rounded-full skeleton-bg admin-pulse shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 skeleton-bg rounded w-48 admin-pulse"></div>
            <div class="h-3 skeleton-bg rounded w-36 admin-pulse"></div>
          </div>
          <div class="h-6 skeleton-bg rounded w-24 admin-pulse"></div>
        </div>
      </div>

      <!-- Employee rate table -->
      <div v-else-if="sortedEmployees.length > 0">
        <table class="w-full min-w-150">
          <thead>
            <tr class="table-header">
              <th class="px-4 py-3 text-left font-semibold">Employee</th>
              <th class="px-4 py-3 text-left font-semibold">Email</th>
              <th class="px-4 py-3 text-right font-semibold w-48">Hourly Rate ($/hr)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr
              v-for="employee in sortedEmployees"
              :key="employee.id"
              class="table-row"
            >
              <!-- Name -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="avatar-badge">
                    <span class="avatar-initials">{{ getInitials(employee.name) }}</span>
                  </div>
                  <span class="text-sm font-medium text-primary">{{ employee.name }}</span>
                </div>
              </td>

              <!-- Email -->
              <td class="px-4 py-3">
                <span class="text-sm text-secondary">{{ employee.email }}</span>
              </td>

              <!-- Hourly Rate: view or edit -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <!-- View mode -->
                  <template v-if="editingId !== employee.id">
                    <span class="text-sm font-medium text-primary tabular-nums">
                      {{
                        employee.hourly_rate !== null
                          ? formatCurrency(employee.hourly_rate)
                          : '—'
                      }}
                    </span>
                    <button
                      @click="startEditRate(employee)"
                      class="btn-icon btn-icon--view"
                      title="Edit rate"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </template>

                  <!-- Edit mode -->
                  <template v-else>
                    <input
                      v-model="editingRate"
                      @keydown="onRateKeydown($event, employee)"
                      type="number"
                      min="0"
                      step="0.01"
                      class="rate-input"
                      autofocus
                    />

                    <!-- Save -->
                    <button
                      @click="saveRate(employee)"
                      :disabled="isSavingRate === employee.id"
                      class="btn-icon btn-icon--save"
                      title="Save"
                    >
                      <svg v-if="isSavingRate !== employee.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="w-4 h-4 admin-spin text-accent" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    </button>

                    <!-- Cancel -->
                    <button
                      @click="cancelEditRate"
                      :disabled="isSavingRate === employee.id"
                      class="btn-icon btn-icon--cancel"
                      title="Cancel"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else class="py-12 text-center">
        <p class="text-sm text-secondary">No employees found</p>
      </div>
    </div>

    <!-- ─── SECTION 2: Process Payroll ────────────────────────────────────────── -->
    <div class="card p-6 mb-6">
      <h2 class="section-title mb-4">Process Payroll</h2>

      <!-- Month / Year selector + Calculate button -->
      <div class="flex flex-wrap items-end gap-3 mb-6">
        <!-- Month -->
        <div class="min-w-40">
          <label class="form-label">Month</label>
          <select
            v-model="selectedMonth"
            class="form-select"
          >
            <option v-for="m in MONTHS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <!-- Year -->
        <div class="min-w-30">
          <label class="form-label">Year</label>
          <select
            v-model="selectedYear"
            class="form-select"
          >
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Calculate button -->
        <button
          @click="generatePayroll"
          :disabled="isGenerating"
          class="btn btn--primary"
        >
          <svg v-if="isGenerating" class="w-4 h-4 admin-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ isGenerating ? 'Calculating...' : 'Calculate' }}
        </button>
      </div>

      <!-- Preview table -->
      <div class="preview-card mb-6">
        <!-- Loading skeleton -->
        <div v-if="isGenerating">
          <div class="preview-header">Preview</div>
          <div class="divide-y divide-border-subtle">
            <div v-for="i in 5" :key="i" class="px-4 py-3.5 flex items-center gap-4">
              <div class="h-4 skeleton-bg rounded admin-pulse w-40"></div>
              <div class="h-4 skeleton-bg rounded admin-pulse w-24 ml-auto"></div>
              <div class="h-4 skeleton-bg rounded admin-pulse w-20"></div>
              <div class="h-4 skeleton-bg rounded admin-pulse w-20"></div>
              <div class="h-4 skeleton-bg rounded admin-pulse w-24"></div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div v-else-if="hasGenerated && preview.length > 0" class="overflow-x-auto">
          <table class="w-full min-w-225">
            <thead>
              <tr class="table-header">
                <th class="px-4 py-3 text-left font-semibold">Employee</th>
                <th class="px-4 py-3 text-right font-semibold">Hours Worked</th>
                <th class="px-4 py-3 text-right font-semibold">Hourly Rate</th>
                <th class="px-4 py-3 text-right font-semibold">Gross</th>
                <th class="px-4 py-3 text-right font-semibold">Bonuses</th>
                <th class="px-4 py-3 text-right font-semibold">Deductions</th>
                <th class="px-4 py-3 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr
                v-for="row in preview"
                :key="row.user_id"
                class="table-row"
              >
                <td class="px-4 py-3">
                  <span class="text-sm font-medium text-primary">{{ row.name }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm text-secondary tabular-nums">{{ formatHours(row.hours_worked) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm text-secondary tabular-nums">{{ formatCurrency(row.hourly_rate) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm font-medium text-primary tabular-nums">{{ formatCurrency(row.gross) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm text-accent tabular-nums">
                    {{ row.bonuses > 0 ? '+' + formatCurrency(row.bonuses) : '—' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm text-danger tabular-nums">
                    {{ row.deductions > 0 ? '-' + formatCurrency(row.deductions) : '—' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-sm font-bold text-primary tabular-nums">{{ formatCurrency(row.net) }}</span>
                </td>
              </tr>
            </tbody>
            <!-- Totals row -->
            <tfoot>
              <tr class="totals-row">
                <td class="px-4 py-3 text-sm font-semibold text-primary">Total</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-secondary tabular-nums">
                  {{ formatHours(preview.reduce((s, r) => s + r.hours_worked, 0)) }}
                </td>
                <td class="px-4 py-3"></td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-primary tabular-nums">
                  {{ formatCurrency(preview.reduce((s, r) => s + r.gross, 0)) }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-accent tabular-nums">
                  {{ formatCurrency(preview.reduce((s, r) => s + r.bonuses, 0)) }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-danger tabular-nums">
                  {{ formatCurrency(preview.reduce((s, r) => s + r.deductions, 0)) }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-bold text-primary tabular-nums">
                  {{ formatCurrency(preview.reduce((s, r) => s + r.net, 0)) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- No preview yet -->
        <div v-else-if="!hasGenerated" class="empty-state">
          <div class="empty-icon">
            <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm text-secondary">Select a month and year, then click Calculate to preview payroll</p>
        </div>

        <!-- Empty result -->
        <div v-else class="empty-state">
          <p class="text-sm text-secondary">No payroll records found for the selected period</p>
        </div>
      </div>
    </div>

    <!-- ─── SECTION 3: Export ────────────────────────────────────────────────── -->
    <div class="card p-6">
      <h2 class="section-title mb-4">Export</h2>

      <div class="flex flex-wrap gap-3">
        <!-- Export Excel -->
        <button
          @click="downloadExport('xlsx')"
          class="export-btn"
        >
          <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export Excel
        </button>

        <!-- Export PDF -->
        <button
          @click="downloadExport('pdf')"
          class="export-btn"
        >
          <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      <p class="text-xs text-muted mt-3">
        Exports payroll for
        {{ MONTHS.find((m) => m.value === selectedMonth)?.label }} {{ selectedYear }}.
        Make sure to calculate the preview first.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────── */
.page {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #10b981;
  --admin-accent-muted: rgba(16, 185, 129, 0.12);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.1);
  --admin-warning: #fbbf24;
  --admin-warning-muted: rgba(251, 191, 36, 0.1);
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;

  background: var(--admin-bg);
}

/* ─── Custom animations ─────────────────────────────────────── */
@keyframes admin-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
@keyframes admin-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.admin-pulse { animation: admin-pulse 1.8s ease-in-out infinite; }
.admin-spin  { animation: admin-spin  0.7s linear infinite; }

/* ─── Color & style classes ──────────────────────────────────── */
.text-primary   { color: var(--admin-text); }
.text-secondary { color: var(--admin-text-secondary); }
.text-muted     { color: var(--admin-text-muted); }
.text-accent    { color: var(--admin-accent); }
.text-danger    { color: var(--admin-danger); }

.bg-card  { background: var(--admin-card); }
.bg-muted { background: var(--admin-bg); }

.skeleton-bg { background: var(--admin-border); }

/* ─── Card ──────────────────────────────────────────────────── */
.card {
  background: var(--admin-card);
  border-radius: var(--admin-radius);
  box-shadow: var(--admin-shadow);
  border: 1px solid var(--admin-border);
}

/* ─── Section title ────────────────────────────────────────── */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--admin-text);
}

/* ─── Avatar badge ──────────────────────────────────────────── */
.avatar-badge {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: var(--admin-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-initials {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-accent);
}

/* ─── Table ─────────────────────────────────────────────────── */
.table-header {
  background: var(--admin-bg);
  color: var(--admin-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.table-row:hover { background: var(--admin-bg); transition: background 0.15s; }

/* ─── Inline edit buttons ──────────────────────────────────── */
.btn-icon {
  padding: 0.375rem;
  border-radius: 0.625rem;
  transition: color 0.15s, background 0.15s;
}
.btn-icon--view:hover {
  color: var(--admin-accent);
  background: var(--admin-accent-muted);
}
.btn-icon--save:hover {
  color: var(--admin-accent);
  background: var(--admin-accent-muted);
}
.btn-icon--cancel:hover {
  color: var(--admin-danger);
  background: var(--admin-danger-muted);
}

/* ─── Rate input ────────────────────────────────────────────── */
.rate-input {
  width: 7rem;
  padding: 0.375rem 0.75rem;
  background: var(--admin-card);
  border: 1px solid var(--admin-accent);
  color: var(--admin-text);
  font-size: 0.875rem;
  border-radius: 0.625rem;
  outline: none;
}
.rate-input:focus {
  box-shadow: 0 0 0 2px var(--admin-accent-muted);
}

/* ─── Form labels & selects ────────────────────────────────── */
.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--admin-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
}
.form-select {
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  color: var(--admin-text);
  font-size: 0.875rem;
  border-radius: 0.75rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  appearance: none;
}
.form-select:focus {
  border-color: var(--admin-accent);
  box-shadow: 0 0 0 2px var(--admin-accent-muted);
}

/* ─── Primary button ────────────────────────────────────────── */
.btn--primary {
  padding: 0.625rem 1.25rem;
  background: var(--admin-accent);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.75rem;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn--primary:hover:not(:disabled) { background: #0d9668; }
.btn--primary:disabled { opacity: 0.6; }

/* ─── Preview card ──────────────────────────────────────────── */
.preview-card {
  border: 1px solid var(--admin-border);
  border-radius: 0.75rem;
  overflow: hidden;
}
.preview-header {
  padding: 0.625rem 1rem;
  background: var(--admin-bg);
  color: var(--admin-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ─── Totals row ────────────────────────────────────────────── */
.totals-row {
  background: var(--admin-bg);
  border-top: 2px solid var(--admin-border);
}

/* ─── Empty state ──────────────────────────────────────────── */
.empty-state {
  padding: 4rem 0;
  text-align: center;
}
.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--admin-radius);
  background: var(--admin-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

/* ─── Export buttons ────────────────────────────────────────── */
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.75rem;
  transition: background 0.15s, color 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.export-btn:hover {
  background: var(--admin-bg);
  color: var(--admin-text);
}
</style>