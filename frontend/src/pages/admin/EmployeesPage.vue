<script setup lang="ts">
import { ref } from 'vue'
import { useEmployeesStore } from '@/store/employees'
import EmployeeFilters from '@/components/admin/employees/EmployeeFilters.vue'
import EmployeeList from '@/components/admin/employees/EmployeeList.vue'
import EmployeeForm from '@/components/admin/employees/EmployeeForm.vue'
import EmployeeDetail from '@/components/admin/employees/EmployeeDetail.vue'
import type { Employee } from '@/types/employee'

const employeesStore = useEmployeesStore()
const isFormOpen = ref(false)
const isDetailOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)

function handleEdit(employee: Employee) {
  selectedEmployee.value = employee
  isFormOpen.value = true
}

function handleAdd() {
  selectedEmployee.value = null
  isFormOpen.value = true
}

function handleView(employee: Employee) {
  selectedEmployee.value = employee
  isDetailOpen.value = true
}

async function handleDelete(id: number) {
  if (
    !confirm(
      'Are you sure you want to delete this employee? This action cannot be undone.',
    )
  ) {
    return
  }

  await employeesStore.deleteEmployee(id)
}

function handleSaved() {
  employeesStore.fetchEmployees(employeesStore.pagination.current_page)
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div
      class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--admin-text)">
          Employees
        </h1>
        <p class="text-sm mt-1" style="color: var(--admin-text-secondary)">
          Manage your organization employees
        </p>
      </div>
      <button
        @click="handleAdd"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-colors"
        style="
          background: var(--admin-accent);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        "
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style="color: #fff"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Employee
      </button>
    </div>

    <!-- Card wrapper with filters -->
    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <EmployeeFilters />
      <EmployeeList
        @edit="handleEdit"
        @view="handleView"
        @delete="handleDelete"
      />
    </div>

    <!-- Form modal -->
    <EmployeeForm
      :is-open="isFormOpen"
      :employee="selectedEmployee"
      @close="isFormOpen = false"
      @saved="handleSaved"
    />

    <!-- Detail modal -->
    <EmployeeDetail
      :is-open="isDetailOpen"
      :employee="selectedEmployee"
      @close="isDetailOpen = false"
    />
  </div>
</template>

<style scoped>
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
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;
  background: var(--admin-bg);
  min-height: 100vh;
}

/* ─── Card backgrounds ─────────────────────────────────────────────── */
:deep(.bg-white) {
  background: var(--admin-card);
  border-radius: var(--admin-radius);
  box-shadow: var(--admin-shadow);
  border: 1px solid var(--admin-border);
}

/* ─── Border helpers ──────────────────────────────────────────────── */
:deep(.border-gray-100) {
  border-bottom: 1px solid var(--admin-border);
}
:deep(.border-gray-200) {
  border-color: var(--admin-border);
}
:deep(.divide-gray-100) > * + * {
  border-top: 1px solid var(--admin-border);
}

/* ─── Border-radius overrides ─────────────────────────────────────── */
:deep(.rounded-2xl) {
  border-radius: var(--admin-radius);
}
:deep(.rounded-xl) {
  border-radius: 0.75rem;
}
:deep(.rounded-full) {
  border-radius: 9999px;
}

/* ─── Box-shadow overrides ─────────────────────────────────────────── */
:deep(.shadow-lg) {
  box-shadow: var(--admin-shadow);
}
:deep(.shadow-2xl) {
  box-shadow: var(--admin-shadow);
}

/* ─── Background helpers ───────────────────────────────────────────── */
:deep(.bg-gray-50) {
  background: var(--admin-bg);
}
:deep(.bg-gray-200) {
  background: var(--admin-border);
}
:deep(.bg-black\/30) {
  background: rgba(0, 0, 0, 0.3);
}

/* ─── Input placeholder color ──────────────────────────────────────── */
::placeholder {
  color: var(--admin-text-muted);
}
</style>
