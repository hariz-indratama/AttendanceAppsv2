<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEmployeesStore } from '@/store/employees'
import type { Employee } from '@/types/employee'

const employeesStore = useEmployeesStore()
const searchQuery = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    employeesStore.setFilters({ search: searchQuery.value })
    employeesStore.fetchEmployees(1)
  }, 400)
}

function handleClear(): void {
  searchQuery.value = ''
  employeesStore.setFilters({ search: '' })
  employeesStore.fetchEmployees(1)
}

function roleBadge(role: string): { color: string; background: string } {
  return role === 'admin'
    ? { color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)' }
    : { color: 'var(--admin-accent)', background: 'var(--admin-accent-muted)' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const emit = defineEmits<{
  (e: 'edit', employee: Employee): void
  (e: 'delete', id: number): void
  (e: 'view', employee: Employee): void
}>()

onMounted(() => {
  if (employeesStore.employees.length === 0) {
    employeesStore.fetchEmployees()
  }
})
</script>

<template>
  <div class="p-4 border-b border-gray-100">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style="color: var(--admin-text-muted)"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        v-model="searchQuery"
        @input="onSearchInput"
        type="text"
        placeholder="Search by name or email..."
        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl transition-colors"
        style="
          color: var(--admin-text);
          border-color: var(--admin-border);
          background: var(--admin-bg);
          --tw-placeholder-color: var(--admin-text-muted);
        "
      />
      <button
        v-if="searchQuery"
        @click="handleClear"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
        style="color: var(--admin-text-muted)"
      >
        Clear
      </button>
    </div>
  </div>
</template>
