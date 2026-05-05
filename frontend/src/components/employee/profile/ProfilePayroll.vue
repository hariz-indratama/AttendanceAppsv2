<script setup lang="ts">
import type { Payroll } from '@/types/payroll'

const props = defineProps<{
  payslips: Payroll[]
  isLoading: boolean
}>()

function statusBadgeClass(status: string) {
  switch (status) {
    case 'paid': return 'text-[var(--success)] bg-[var(--success-muted)]'
    case 'pending': return 'text-[var(--warning)] bg-[var(--warning-muted)]'
    case 'approved': return 'text-[#60a5fa] bg-[rgba(96,165,250,0.1)]'
    default: return 'text-[var(--text-muted)] bg-[var(--bg)]'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function payslipPeriod(p: Payroll): string {
  return new Date(p.year, p.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="tab-content">
    <div v-if="isLoading" class="payslip-skeleton">
      <div v-for="i in 3" :key="i" class="skel-payslip" />
    </div>

    <template v-else-if="payslips.length > 0" style="animation-delay: 120ms">
      <div v-for="payslip in payslips" :key="payslip.id" class="payslip-card">
        <div class="payslip-header">
          <p class="payslip-period">{{ payslipPeriod(payslip) }}</p>
          <span class="payslip-status" :class="statusBadgeClass(payslip.status)">
            {{ payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1) }}
          </span>
        </div>
        <p class="payslip-hours">
          {{ payslip.total_hours.toFixed(1) }}h logged
          <span v-if="payslip.overtime_hours > 0"> · {{ payslip.overtime_hours.toFixed(1) }}h OT</span>
        </p>
        <div class="payslip-grid">
          <div>
            <p class="payslip-key">Gross</p>
            <p class="payslip-val">{{ formatCurrency(payslip.gross_salary) }}</p>
          </div>
          <div>
            <p class="payslip-key">Deductions</p>
            <p class="payslip-val payslip-val--danger">-{{ formatCurrency(payslip.deductions + payslip.late_deductions) }}</p>
          </div>
          <div>
            <p class="payslip-key">Net</p>
            <p class="payslip-val payslip-val--net">{{ formatCurrency(payslip.net_salary) }}</p>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="card empty-state" style="animation-delay: 120ms">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="empty-title">No payroll records</p>
      <p class="empty-sub">Payslips will appear here once processed.</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

.payslip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  animation: fadeUp 300ms ease-out both;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3);
}

.payslip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.payslip-period {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.payslip-status {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.6875rem;
  font-weight: 600;
  border: 1px solid;
  flex-shrink: 0;
}

.payslip-hours {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.875rem;
}

.payslip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.payslip-key {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.payslip-val {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.payslip-val--danger { color: var(--danger); }
.payslip-val--net {
  font-size: 1.125rem;
  font-weight: 800;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  gap: 0.75rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg { width: 1.5rem; height: 1.5rem; color: var(--text-muted); }
.empty-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-secondary); }
.empty-sub   { font-size: 0.8125rem; color: var(--text-muted); }

/* Skeletons */
.payslip-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }
.skel-payslip { height: 7rem; background: var(--border); border-radius: 0.75rem; animation: pulse 1.5s ease-in-out infinite; }
</style>
