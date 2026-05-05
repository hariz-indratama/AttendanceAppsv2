<script setup lang="ts">
import { computed } from 'vue'
import { useEmployeesStore } from '@/store/employees'
import type { Employee } from '@/types/employee'

const employeesStore = useEmployeesStore()

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

const currentPage = computed(() => employeesStore.pagination.current_page)
const lastPage = computed(() => employeesStore.pagination.last_page)
const searchQuery = computed(() => employeesStore.filters.search)
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
  >
    <!-- Loading skeleton -->
    <div v-if="employeesStore.isLoading" class="divide-y divide-gray-100">
      <div v-for="i in 6" :key="i" class="p-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-full shrink-0 skeleton-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 rounded w-40 skeleton-pulse"></div>
          <div class="h-3 rounded w-56 skeleton-pulse"></div>
        </div>
        <div class="h-6 rounded w-20 skeleton-pulse"></div>
        <div class="w-16 h-8 rounded skeleton-pulse"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="employeesStore.employees.length > 0">
      <!-- Table header -->
      <div
        class="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider"
        style="
          color: var(--admin-text-secondary);
          background: var(--admin-bg);
        "
      >
        <div class="col-span-5">Name</div>
        <div class="col-span-4">Email</div>
        <div class="col-span-2">Role</div>
        <div class="col-span-1 text-right">Actions</div>
      </div>

      <!-- Table rows -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="employee in employeesStore.employees"
          :key="employee.id"
          class="p-4 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center md:py-0 hover:bg-gray-50 transition-colors"
        >
          <!-- Name -->
          <div class="col-span-5 flex items-center gap-3 md:py-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style="background: var(--admin-accent-muted)"
            >
              <span
                class="text-sm font-semibold"
                style="color: var(--admin-accent)"
                >{{ getInitials(employee.name) }}</span
              >
            </div>
            <span
              class="text-sm font-semibold truncate"
              style="color: var(--admin-text)"
              >{{ employee.name }}</span
            >
          </div>

          <!-- Email -->
          <div class="col-span-4 md:py-4">
            <span
              class="text-sm truncate block"
              style="color: var(--admin-text-secondary)"
              >{{ employee.email }}</span
            >
          </div>

          <!-- Role -->
          <div class="col-span-2 md:py-4">
            <span
              class="inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize"
              :style="{
                color: roleBadge(employee.role).color,
                background: roleBadge(employee.role).background,
              }"
            >
              {{ employee.role }}
            </span>
          </div>

          <!-- Actions -->
          <div
            class="col-span-1 md:py-4 flex items-center justify-end md:justify-end gap-1"
          >
            <!-- View -->
            <button
              @click="emit('view', employee)"
              class="action-btn"
              title="View Details"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <!-- Edit -->
            <button
              @click="emit('edit', employee)"
              class="action-btn"
              title="Edit"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            <!-- Delete -->
            <button
              @click="emit('delete', employee.id)"
              class="action-btn action-btn--danger"
              title="Delete"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <p class="text-xs" style="color: var(--admin-text-secondary)">
          Page {{ currentPage }} of {{ lastPage }}
        </p>
        <div class="flex gap-2">
          <button
            :disabled="currentPage <= 1"
            @click="employeesStore.fetchEmployees(currentPage - 1)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage <= 1 }"
            style="
              border: 1px solid var(--admin-border);
              color: var(--admin-text-secondary);
              background: transparent;
            "
          >
            Prev
          </button>
          <button
            :disabled="currentPage >= lastPage"
            @click="employeesStore.fetchEmployees(currentPage + 1)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage >= lastPage }"
            style="
              border: 1px solid var(--admin-border);
              color: var(--admin-text-secondary);
              background: transparent;
            "
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="p-12 text-center">
      <div
        class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style="background: var(--admin-bg)"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style="color: var(--admin-text-muted)"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <p class="text-sm" style="color: var(--admin-text-secondary)">
        {{
          searchQuery
            ? 'No employees match your search'
            : 'No employees found'
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── Skeleton pulse ────────────────────────────────────────────────── */
.skeleton-pulse {
  background: var(--admin-border);
  animation: admin-pulse 1.5s ease-in-out infinite;
}

@keyframes admin-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

/* ─── Action buttons ────────────────────────────────────────────────── */
.action-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: color 150ms ease, background 150ms ease;
  color: var(--admin-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: var(--admin-accent);
  background: var(--admin-accent-muted);
}

.action-btn--danger:hover {
  color: var(--admin-danger);
  background: var(--admin-danger-muted);
}
</style>
