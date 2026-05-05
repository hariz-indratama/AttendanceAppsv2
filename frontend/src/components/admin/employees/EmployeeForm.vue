<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEmployeesStore } from '@/store/employees'
import type { CreateEmployee, UpdateEmployee, Employee } from '@/types/employee'

const props = defineProps<{
  employee?: Employee | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const employeesStore = useEmployeesStore()
const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'employee' as 'employee' | 'admin',
})
const formError = ref('')

watch(() => props.employee, (emp) => {
  if (emp) {
    formData.value = {
      name: emp.name,
      email: emp.email,
      password: '',
      role: emp.role,
    }
  } else {
    formData.value = { name: '', email: '', password: '', role: 'employee' }
  }
  formError.value = ''
}, { immediate: true })

watch(() => props.isOpen, (open) => {
  if (open) formError.value = ''
})

async function handleSubmit() {
  formError.value = ''
  let result

  if (props.employee?.id) {
    result = await employeesStore.updateEmployee(props.employee.id, {
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
    } as UpdateEmployee)
  } else {
    result = await employeesStore.createEmployee({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      role: formData.value.role,
    } as CreateEmployee)
  }

  if (result.success) {
    emit('saved')
    emit('close')
  } else {
    formError.value = result.message || 'An error occurred. Please try again.'
  }
}

function closePanel() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex justify-end"
      @click.self="closePanel"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        @click="closePanel"
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
            {{ employee ? 'Edit Employee' : 'Add Employee' }}
          </h2>
          <button
            @click="closePanel"
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
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Error -->
          <div
            v-if="formError"
            class="p-3 rounded-xl text-sm"
            style="
              background: var(--admin-danger-muted);
              border: 1px solid rgba(248, 113, 113, 0.2);
              color: var(--admin-danger);
            "
          >
            {{ formError }}
          </div>

          <!-- Name -->
          <div>
            <label
              class="block text-sm font-medium mb-1.5"
              style="color: var(--admin-text-secondary)"
              >Name</label
            >
            <input
              v-model="formData.name"
              type="text"
              placeholder="Full name"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl transition-colors"
              style="
                color: var(--admin-text);
                border-color: var(--admin-border);
                background: var(--admin-bg);
              "
            />
          </div>

          <!-- Email -->
          <div>
            <label
              class="block text-sm font-medium mb-1.5"
              style="color: var(--admin-text-secondary)"
              >Email</label
            >
            <input
              v-model="formData.email"
              type="email"
              placeholder="name@company.com"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl transition-colors"
              style="
                color: var(--admin-text);
                border-color: var(--admin-border);
                background: var(--admin-bg);
              "
            />
          </div>

          <!-- Password -->
          <div>
            <label
              class="block text-sm font-medium mb-1.5"
              style="color: var(--admin-text-secondary)"
            >
              Password
              <span
                v-if="!employee"
                style="color: var(--admin-danger)"
                >*</span
              >
              <span v-else class="text-gray-400 font-normal text-xs"
                >(leave blank to keep current)</span
              >
            </label>
            <input
              v-model="formData.password"
              type="password"
              :placeholder="
                employee
                  ? 'Leave blank to keep current'
                  : 'Min. 8 characters'
              "
              :required="!employee"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl transition-colors"
              style="
                color: var(--admin-text);
                border-color: var(--admin-border);
                background: var(--admin-bg);
              "
            />
          </div>

          <!-- Role -->
          <div>
            <label
              class="block text-sm font-medium mb-1.5"
              style="color: var(--admin-text-secondary)"
              >Role</label
            >
            <select
              v-model="formData.role"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl transition-colors appearance-none"
              style="
                color: var(--admin-text);
                border-color: var(--admin-border);
                background: var(--admin-bg);
              "
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <!-- Panel footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            @click="closePanel"
            class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
            style="
              background: var(--admin-bg);
              color: var(--admin-text-secondary);
              border: 1px solid var(--admin-border);
            "
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="employeesStore.isLoading"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50"
            style="background: var(--admin-accent)"
          >
            {{ employee ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
