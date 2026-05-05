<script setup lang="ts">
// ─── Types ──────────────────────────────────────────────────────────────────────

interface MonthOption {
  value: number
  label: string
}

// ─── Props & Emits ─────────────────────────────────────────────────────────────

interface Props {
  selectedMonth: number
  selectedYear: number
  yearOptions: number[]
  isGenerating: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedMonth': [value: number]
  'update:selectedYear': [value: number]
  'generate': []
}>()

// ─── Constants ─────────────────────────────────────────────────────────────────

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

// ─── Event Handlers ─────────────────────────────────────────────────────────────

function onMonthChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:selectedMonth', Number(target.value))
}

function onYearChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:selectedYear', Number(target.value))
}

function onGenerate(): void {
  emit('generate')
}
</script>

<template>
  <div class="payroll-period-selector">
    <div class="flex flex-wrap items-end gap-3">
      <!-- Month -->
      <div class="min-w-40">
        <label class="form-label">Month</label>
        <select
          :value="selectedMonth"
          @change="onMonthChange"
          class="form-select"
        >
          <option v-for="m in MONTHS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <!-- Year -->
      <div class="min-w-30">
        <label class="form-label">Year</label>
        <select
          :value="selectedYear"
          @change="onYearChange"
          class="form-select"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- Calculate button -->
      <button
        @click="onGenerate"
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
  </div>
</template>

<style scoped>
.payroll-period-selector {
  --admin-bg: #0a0f1a;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-accent: #10b981;
  --admin-accent-muted: rgba(16, 185, 129, 0.12);

  color: var(--admin-text);
}

/* ─── Custom animations ─────────────────────────────────────── */
@keyframes admin-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.admin-spin { animation: admin-spin 0.7s linear infinite; }

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
</style>
