<script setup lang="ts">
// ─── Types ──────────────────────────────────────────────────────────────────────

export interface PayrollPreviewEntry {
  user_id: number
  name: string
  hours_worked: number
  hourly_rate: number
  gross: number
  bonuses: number
  deductions: number
  net: number
}

// ─── Props & Emits ──────────────────────────────────────────────────────────────

interface Props {
  preview: PayrollPreviewEntry[]
  isGenerating: boolean
  hasGenerated: boolean
}

const props = defineProps<Props>()

// ─── Helpers ────────────────────────────────────────────────────────────────────

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

// ─── Computed ───────────────────────────────────────────────────────────────────

const totalHours = props.preview.reduce((s, r) => s + r.hours_worked, 0)
const totalGross = props.preview.reduce((s, r) => s + r.gross, 0)
const totalBonuses = props.preview.reduce((s, r) => s + r.bonuses, 0)
const totalDeductions = props.preview.reduce((s, r) => s + r.deductions, 0)
const totalNet = props.preview.reduce((s, r) => s + r.net, 0)
</script>

<template>
  <div class="payroll-preview-table">
    <div class="preview-card">
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
                {{ formatHours(totalHours) }}
              </td>
              <td class="px-4 py-3"></td>
              <td class="px-4 py-3 text-right text-sm font-semibold text-primary tabular-nums">
                {{ formatCurrency(totalGross) }}
              </td>
              <td class="px-4 py-3 text-right text-sm font-semibold text-accent tabular-nums">
                {{ formatCurrency(totalBonuses) }}
              </td>
              <td class="px-4 py-3 text-right text-sm font-semibold text-danger tabular-nums">
                {{ formatCurrency(totalDeductions) }}
              </td>
              <td class="px-4 py-3 text-right text-sm font-bold text-primary tabular-nums">
                {{ formatCurrency(totalNet) }}
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
</template>

<style scoped>
.payroll-preview-table {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #10b981;
  --admin-danger: #f87171;

  color: var(--admin-text);
}

/* ─── Custom animations ─────────────────────────────────────── */
@keyframes admin-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
.admin-pulse { animation: admin-pulse 1.8s ease-in-out infinite; }

/* ─── Color & style classes ──────────────────────────────────── */
.text-primary   { color: var(--admin-text); }
.text-secondary { color: var(--admin-text-secondary); }
.text-muted     { color: var(--admin-text-muted); }
.text-accent    { color: var(--admin-accent); }
.text-danger    { color: var(--admin-danger); }
.skeleton-bg { background: var(--admin-border); }

/* ─── Table ─────────────────────────────────────────────────── */
.table-header {
  background: var(--admin-bg);
  color: var(--admin-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.table-row:hover { background: var(--admin-bg); transition: background 0.15s; }

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
  border-radius: var(--admin-radius, 1rem);
  background: var(--admin-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
</style>
