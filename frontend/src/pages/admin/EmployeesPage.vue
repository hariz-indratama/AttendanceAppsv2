<script setup lang="ts">
import { ref, onMounted } from "vue";
import apiClient from "@/api/axios";
import type { User } from "@/types/auth";
import type { PaginatedResponse } from "@/types/auth";

// ─── State ───────────────────────────────────────────────────────────────────

const employees = ref<User[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const lastPage = ref(1);
const isLoading = ref(true);
const isSaving = ref(false);

const isPanelOpen = ref(false);
const editingId = ref<number | null>(null);
const formError = ref("");

const form = ref({
  name: "",
  email: "",
  password: "",
  role: "employee" as "employee" | "admin",
});

// ─── Search debounce ───────────────────────────────────────────────────────────

let searchTimer: ReturnType<typeof setTimeout> | null = null;

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchEmployees();
  }, 400);
}

// ─── Data fetching ───────────────────────────────────────────────────────────────

async function fetchEmployees(page = 1): Promise<void> {
  isLoading.value = true;
  try {
    const res = await apiClient.get<PaginatedResponse<User>>(
      "/admin/employees",
      {
        params: {
          search: searchQuery.value.trim(),
          page,
        },
      },
    );
    employees.value = res.data.data;
    currentPage.value = res.data.meta.current_page;
    lastPage.value = res.data.meta.last_page;
  } catch {
    employees.value = [];
  } finally {
    isLoading.value = false;
  }
}

// ─── Panel ─────────────────────────────────────────────────────────────────────

function openCreate(): void {
  editingId.value = null;
  form.value = { name: "", email: "", password: "", role: "employee" };
  formError.value = "";
  isPanelOpen.value = true;
}

function openEdit(employee: User): void {
  editingId.value = employee.id;
  form.value = {
    name: employee.name,
    email: employee.email,
    password: "",
    role: employee.role,
  };
  formError.value = "";
  isPanelOpen.value = true;
}

function closePanel(): void {
  isPanelOpen.value = false;
  editingId.value = null;
  form.value = { name: "", email: "", password: "", role: "employee" };
  formError.value = "";
}

async function saveEmployee(): Promise<void> {
  formError.value = "";
  isSaving.value = true;

  const payload =
    editingId.value !== null
      ? {
          name: form.value.name,
          email: form.value.email,
          role: form.value.role,
        }
      : {
          name: form.value.name,
          email: form.value.email,
          password: form.value.password,
          role: form.value.role,
        };

  try {
    if (editingId.value !== null) {
      await apiClient.put(`/admin/employees/${editingId.value}`, payload);
    } else {
      await apiClient.post("/admin/employees", payload);
    }
    closePanel();
    await fetchEmployees(currentPage.value);
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    formError.value = message || "An error occurred. Please try again.";
  } finally {
    isSaving.value = false;
  }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

async function deleteEmployee(id: number): Promise<void> {
  if (
    !confirm(
      "Are you sure you want to delete this employee? This action cannot be undone.",
    )
  ) {
    return;
  }

  const original = employees.value.find((e) => e.id === id);
  if (!original) return;

  // Optimistic delete
  employees.value = employees.value.filter((e) => e.id !== id);

  try {
    await apiClient.delete(`/admin/employees/${id}`);
  } catch {
    // Restore on failure
    employees.value = employees.value
      .concat(original)
      .sort((a, b) => a.id - b.id);
    alert("Failed to delete employee. Please try again.");
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roleBadge(role: string): { color: string; background: string } {
  return role === "admin"
    ? { color: "#a78bfa", background: "rgba(167, 139, 250, 0.1)" }
    : { color: "var(--admin-accent)", background: "var(--admin-accent-muted)" };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchEmployees();
});
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
        @click="openCreate"
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

    <!-- Card wrapper -->
    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <!-- Search bar -->
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
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="divide-y divide-gray-100">
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
      <div v-else-if="employees.length > 0">
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
            v-for="employee in employees"
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
              <!-- Edit -->
              <button
                @click="openEdit(employee)"
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
                @click="deleteEmployee(employee.id)"
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
              @click="fetchEmployees(currentPage - 1)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
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
              @click="fetchEmployees(currentPage + 1)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
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
              ? "No employees match your search"
              : "No employees found"
          }}
        </p>
        <button
          v-if="!searchQuery"
          @click="openCreate"
          class="mt-4 text-sm font-medium"
          style="color: var(--admin-accent)"
        >
          Add your first employee
        </button>
      </div>
    </div>

    <!-- Slide-over panel -->
    <Teleport to="body">
      <div
        v-if="isPanelOpen"
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
          v-if="isPanelOpen"
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
              {{ editingId !== null ? "Edit Employee" : "Add Employee" }}
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
                v-model="form.name"
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
                v-model="form.email"
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
                  v-if="editingId === null"
                  style="color: var(--admin-danger)"
                  >*</span
                >
                <span v-else class="text-gray-400 font-normal text-xs"
                  >(leave blank to keep current)</span
                >
              </label>
              <input
                v-model="form.password"
                type="password"
                :placeholder="
                  editingId !== null
                    ? 'Leave blank to keep current'
                    : 'Min. 8 characters'
                "
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
                v-model="form.role"
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
              @click="saveEmployee"
              :disabled="isSaving"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors"
              style="background: var(--admin-accent)"
            >
              {{
                isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update"
                    : "Create"
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* All styles consume global CSS tokens from base.css */
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
  --admin-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;
  background: var(--admin-bg);
  min-height: 100vh;
}

/* ─── Card / panel backgrounds ──────────────────────────────────────── */
:deep(.bg-white) {
  background: var(--admin-card);
  border-radius: var(--admin-radius);
  box-shadow: var(--admin-shadow);
  border: 1px solid var(--admin-border);
}

/* ─── Border helpers (utility classes still used in template) ────────── */
:deep(.border-gray-100) {
  border-bottom: 1px solid var(--admin-border);
}
:deep(.border-gray-200) {
  border-color: var(--admin-border);
}
:deep(.divide-gray-100) > * + * {
  border-top: 1px solid var(--admin-border);
}
:deep(.divide-y) > * + * {
  border-top: 1px solid var(--admin-border);
}

/* ─── Border-radius overrides (Tailwind classes still in template) ──── */
:deep(.rounded-2xl) {
  border-radius: var(--admin-radius);
}
:deep(.rounded-xl) {
  border-radius: 0.75rem;
}
:deep(.rounded-full) {
  border-radius: 9999px;
}

/* ─── Box-shadow overrides (Tailwind classes still in template) ─────── */
:deep(.shadow-lg) {
  box-shadow: var(--admin-shadow);
}
:deep(.shadow-2xl) {
  box-shadow: var(--admin-shadow);
}
:deep(.shadow-sm) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* ─── Background helpers ─────────────────────────────────────────────── */
:deep(.bg-gray-50) {
  background: var(--admin-bg);
}
:deep(.bg-gray-200) {
  background: var(--admin-border);
}
:deep(.bg-black\/30) {
  background: rgba(0, 0, 0, 0.3);
}

/* ─── Hover states ───────────────────────────────────────────────────── */
:deep(.hover\:bg-gray-50):hover {
  background: var(--admin-accent-muted);
}

/* ─── Input placeholder color ───────────────────────────────────────── */
::placeholder {
  color: var(--admin-text-muted);
}

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
