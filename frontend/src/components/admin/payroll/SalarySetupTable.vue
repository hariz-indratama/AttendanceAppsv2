<script setup lang="ts">
import type { User } from '@/types/auth'
import apiClient from '@/api/axios'

// ─── Props & Emits ─────────────────────────────────────────────────────────────

interface Props {
  employees: User[]
  isLoading: boolean
  editingId: number | null
  editingRate: string
  isSavingRate: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'start-edit': [employee: User]
  'cancel-edit': []
  'save-rate': [employee: User]
  'update:editingRate': [value: string]
  'rate-keydown': [event: KeyboardEvent, employee: User]
}>()

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

// ─── Event Handlers ─────────────────────────────────────────────────────────────

function onStartEdit(employee: User): void {
  emit('start-edit', employee)
}

function onCancelEdit(): void {
  emit('cancel-edit')
}

function onSaveRate(employee: User): void {
  emit('save-rate', employee)
}

function onRateKeydown(event: KeyboardEvent, employee: User): void {
  emit('rate-keydown', event, employee)
}

function onEditingRateInput(value: string): void {
  emit('update:editingRate', value)
}
</script>

<template>
  <div class="salary-setup-table">
    <!-- Skeleton loading -->
    <div v-if="isLoading" class="skeleton-container">
      <div v-for="i in 6" :key="i" class="flex items-center gap-4">
        <div class="w-9 h-9 rounded-full skeleton-bg admin-pulse shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 skeleton-bg rounded w-48 admin-pulse"></div>
          <div class="h-3 skeleton-bg rounded w-36 admin-pulse"></div>
        </div>
        <div class="h-6 skeleton-bg rounded w-24 admin-pulse"></div>
      </div>
    </div>

    <!-- Employee table -->
    <div v-else-if="employees.length > 0">
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
            v-for="employee in employees"
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
                    {{ formatCurrency(employee.hourly_rate) }}
                  </span>
                  <button
                    @click="onStartEdit(employee)"
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
                    :value="editingRate"
                    @input="onEditingRateInput(($event.target as HTMLInputElement).value)"
                    @keydown="onRateKeydown($event, employee)"
                    type="number"
                    min="0"
                    step="0.01"
                    class="rate-input"
                    autofocus
                  />

                  <!-- Save -->
                  <button
                    @click="onSaveRate(employee)"
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
                    @click="onCancelEdit"
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

    <!-- Empty state -->
    <div v-else class="py-12 text-center">
      <p class="text-sm text-secondary">No employees found</p>
    </div>
  </div>
</template>

<style scoped>
.salary-setup-table {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-accent: #10b981;
  --admin-accent-muted: rgba(16, 185, 129, 0.12);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.1);

  color: var(--admin-text);
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
.skeleton-bg { background: var(--admin-border); }

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
.text-accent { color: var(--admin-accent); }
</style>
