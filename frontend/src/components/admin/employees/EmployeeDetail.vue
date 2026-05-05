<script setup lang="ts">
import type { Employee } from '@/types/employee'

const props = defineProps<{
  employee: Employee | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && employee"
      class="fixed inset-0 z-50 flex justify-end"
      @click.self="emit('close')"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <!-- Panel -->
      <div
        class="relative w-96 max-w-full h-full bg-white shadow-2xl flex flex-col"
      >
        <!-- Panel header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h2
            class="text-base font-semibold"
            style="color: var(--admin-text)"
          >
            Employee Details
          </h2>
          <button
            @click="emit('close')"
            class="p-2 rounded-lg transition-colors"
            style="color: var(--admin-text-muted); background: transparent"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Panel body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Avatar and name -->
          <div class="text-center">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
              style="background: var(--admin-accent-muted)"
            >
              <span
                class="text-2xl font-semibold"
                style="color: var(--admin-accent)"
              >
                {{ employee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) }}
              </span>
            </div>
            <h3 class="text-lg font-semibold" style="color: var(--admin-text)">
              {{ employee.name }}
            </h3>
            <span
              class="inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize mt-2"
              :style="{
                color: employee.role === 'admin' ? '#a78bfa' : 'var(--admin-accent)',
                background: employee.role === 'admin' ? 'rgba(167, 139, 250, 0.1)' : 'var(--admin-accent-muted)',
              }"
            >
              {{ employee.role }}
            </span>
          </div>

          <!-- Details list -->
          <div class="space-y-4">
            <div>
              <label class="text-xs uppercase tracking-wider" style="color: var(--admin-text-muted)">
                Email
              </label>
              <p class="text-sm mt-1" style="color: var(--admin-text)">
                {{ employee.email }}
              </p>
            </div>

            <div>
              <label class="text-xs uppercase tracking-wider" style="color: var(--admin-text-muted)">
                Hourly Rate
              </label>
              <p class="text-sm mt-1" style="color: var(--admin-text)">
                {{ employee.hourly_rate ? `$${employee.hourly_rate.toFixed(2)}` : 'Not set' }}
              </p>
            </div>

            <div>
              <label class="text-xs uppercase tracking-wider" style="color: var(--admin-text-muted)">
                Department
              </label>
              <p class="text-sm mt-1" style="color: var(--admin-text)">
                {{ employee.department_id ? `Department #${employee.department_id}` : 'Not assigned' }}
              </p>
            </div>

            <div>
              <label class="text-xs uppercase tracking-wider" style="color: var(--admin-text-muted)">
                Joined
              </label>
              <p class="text-sm mt-1" style="color: var(--admin-text)">
                {{ new Date(employee.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Panel footer -->
        <div class="px-6 py-4 border-t border-gray-100">
          <button
            @click="emit('close')"
            class="w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
            style="
              background: var(--admin-bg);
              color: var(--admin-text-secondary);
              border: 1px solid var(--admin-border);
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
