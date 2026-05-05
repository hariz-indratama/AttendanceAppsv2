# Frontend Critical Refactoring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose 9 monolithic pages, fix auth interceptor, clean up entry points, add API service layer and domain stores.

**Architecture:** Smart container pattern — page orchestrators delegate to child components that manage their own state via dedicated Pinia stores. Services are internal to stores. API interceptor reads auth store for context-aware redirects.

**Tech Stack:** Vue 3 (Script Setup + TypeScript), Pinia, Axios, Tailwind CSS

---

## File Structure

```
frontend/src/
├── main.ts                         # NEW: shared bootstrap (exported)
├── api/
│   ├── axios.ts                    # MODIFY: use authStore for 401 redirect
│   ├── auth.service.ts             # NEW
│   ├── attendance.service.ts       # NEW
│   ├── employees.service.ts        # NEW
│   ├── payroll.service.ts          # NEW
│   └── settings.service.ts         # NEW
├── store/
│   ├── auth.ts                     # MODIFY: add loginPath + redirectPath
│   ├── attendance.ts              # NEW
│   ├── employees.ts               # NEW
│   ├── payroll.ts                 # NEW
│   ├── profile.ts                 # NEW
│   ├── notifications.ts           # NEW
│   └── ui.ts                      # NEW
├── types/
│   ├── api.ts                     # EXISTING (keep)
│   ├── auth.ts                    # EXISTING (trim to auth only)
│   ├── attendance.ts              # NEW: split from auth.ts
│   ├── employee.ts                # NEW
│   ├── payroll.ts                 # NEW
│   ├── leave.ts                   # NEW
│   ├── geofence.ts                # NEW
│   └── settings.ts                # NEW
├── components/
│   ├── admin/
│   │   └── settings/              # NEW child components
│   ├── employee/
│   │   ├── profile/               # NEW child components
│   │   ├── clock/                # NEW child components
│   │   └── settings/              # NEW child components
│   └── shared/                    # NEW: cross-app components
├── admin/
│   └── main.ts                    # MODIFY: import from src/main.ts
└── employee/
    └── main.ts                    # MODIFY: import from src/main.ts
```

---

## Task 1: Extend Auth Store

**Files:**
- Modify: `frontend/src/store/auth.ts`

- [ ] **Step 1: Read current auth store**

```typescript
// Current state interface (lines 6-10)
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
```

- [ ] **Step 2: Add loginPath and redirectPath to state**

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loginPath: string          // NEW: for 401 redirect
  redirectPath: string       // NEW: for post-login redirect
}
```

- [ ] **Step 3: Add refs for new state**

```typescript
const loginPath = ref<string>('/login')
const redirectPath = ref<string>('')
```

- [ ] **Step 4: Add setter actions**

```typescript
function setLoginPath(path: string) {
  loginPath.value = path
}

function setRedirectPath(path: string) {
  redirectPath.value = path
}
```

- [ ] **Step 5: Export new state and actions**

```typescript
return {
  user,
  token,
  isAuthenticated,
  loginPath,
  redirectPath,
  login,
  register,
  logout,
  fetchUser,
  setLoginPath,
  setRedirectPath,
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/store/auth.ts
git commit -m "feat(auth): add loginPath and redirectPath to auth store"
```

---

## Task 2: Fix Axios Interceptor

**Files:**
- Modify: `frontend/src/api/axios.ts`

- [ ] **Step 1: Read current axios.ts**

Note: Lines 49 and 56 have `window.location.href = '/login'`

- [ ] **Step 2: Import auth store**

```typescript
import { useAuthStore } from '@/store/auth'
```

- [ ] **Step 3: Create redirect function**

```typescript
function handleUnauthorized() {
  const authStore = useAuthStore()
  const currentPath = window.location.pathname
  authStore.setRedirectPath(currentPath)
  window.location.href = authStore.loginPath
}
```

- [ ] **Step 4: Replace hardcoded redirects**

Lines 49 and 56: Replace `window.location.href = '/login'` with `handleUnauthorized()`

- [ ] **Step 5: Run lint check**

Run: `cd frontend && npm run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/api/axios.ts
git commit -m "fix(api): use authStore for context-aware 401 redirect"
```

---

## Task 3: Create Type Files

**Files:**
- Create: `frontend/src/types/attendance.ts`
- Create: `frontend/src/types/employee.ts`
- Create: `frontend/src/types/payroll.ts`
- Create: `frontend/src/types/leave.ts`
- Create: `frontend/src/types/geofence.ts`
- Create: `frontend/src/types/settings.ts`
- Modify: `frontend/src/types/auth.ts`

- [ ] **Step 1: Create attendance.ts**

```typescript
export interface Attendance {
  id: number
  user_id: number
  clock_in: string
  clock_out: string | null
  lat_in: number | null
  long_in: number | null
  lat_out: number | null
  long_out: number | null
  status: 'present' | 'late' | 'absent' | 'half_day'
  total_hours: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClockInRequest {
  latitude: number
  longitude: number
  device_id: string
  biometric_verified: boolean
}

export interface ClockOutRequest {
  latitude: number
  longitude: number
  notes?: string
}

export interface AttendanceSummary {
  total_present: number
  total_late: number
  total_absent: number
  average_hours: number
}
```

- [ ] **Step 2: Create employee.ts**

```typescript
export interface Employee {
  id: number
  name: string
  email: string
  role: 'employee' | 'admin'
  hourly_rate: number | null
  department_id: number | null
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface CreateEmployee {
  name: string
  email: string
  password: string
  role: 'employee' | 'admin'
  hourly_rate?: number
  department_id?: number
}

export interface UpdateEmployee {
  name?: string
  email?: string
  role?: 'employee' | 'admin'
  hourly_rate?: number
  department_id?: number
  avatar?: string
}
```

- [ ] **Step 3: Create payroll.ts**

```typescript
export interface Payroll {
  id: number
  user_id: number
  month: number
  year: number
  gross_salary: number
  net_salary: number
  total_hours: number
  overtime_hours: number
  bonuses: number
  deductions: number
  late_deductions: number
  status: 'draft' | 'pending' | 'approved' | 'paid'
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface PayrollItem {
  employee_id: number
  employee_name: string
  base_hours: number
  overtime_hours: number
  hourly_rate: number
  gross: number
  deductions: number
  net: number
}

export interface DeductionItem {
  type: 'late' | 'absent' | 'other'
  amount: number
  reason: string
}
```

- [ ] **Step 4: Create leave.ts**

```typescript
export interface LeaveRequest {
  id: number
  user_id: number
  type: 'sick' | 'vacation' | 'personal' | 'other'
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: number | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  sick_used: number
  sick_total: number
  vacation_used: number
  vacation_total: number
  personal_used: number
  personal_total: number
}
```

- [ ] **Step 5: Create geofence.ts**

```typescript
export interface GeofenceLocation {
  office_id: number
  name: string
  latitude: number
  longitude: number
  radius_meters: number
}

export interface GeofenceCheckResult {
  is_within_range: boolean
  distance_meters: number
  office_name: string
}
```

- [ ] **Step 6: Create settings.ts**

```typescript
export interface AppSettings {
  company_name: string
  timezone: string
  work_start_time: string
  work_end_time: string
  overtime_threshold_hours: number
  late_threshold_minutes: number
}

export interface NotificationSettings {
  push_enabled: boolean
  email_enabled: boolean
  clock_in_reminder: boolean
  clock_out_reminder: boolean
  payroll_notifications: boolean
}

export interface WorkSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  enabled: boolean
  start_time: string
  end_time: string
}
```

- [ ] **Step 7: Trim auth.ts to keep only auth types**

```typescript
export interface User {
  id: number
  name: string
  email: string
  role: 'employee' | 'admin'
  hourly_rate: number | null
  department_id: number | null
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface TokenResponse {
  user: User
  token: string
  refresh_token: string
}
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/types/
git commit -m "refactor(types): split monolithic auth.ts into domain files"
```

---

## Task 4: Create API Services

**Files:**
- Create: `frontend/src/api/auth.service.ts`
- Create: `frontend/src/api/attendance.service.ts`
- Create: `frontend/src/api/employees.service.ts`
- Create: `frontend/src/api/payroll.service.ts`
- Create: `frontend/src/api/settings.service.ts`

- [ ] **Step 1: Create auth.service.ts**

```typescript
import apiClient from './axios'
import type { User, LoginCredentials, TokenResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  async getUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/user')
    return response.data
  },
}
```

- [ ] **Step 2: Create attendance.service.ts**

```typescript
import apiClient from './axios'
import type { Attendance, ClockInRequest, ClockOutRequest, AttendanceSummary } from '@/types/attendance'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const attendanceService = {
  async clockIn(data: ClockInRequest): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.post('/attendance/clock-in', data)
    return response.data
  },

  async clockOut(data: ClockOutRequest): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.post('/attendance/clock-out', data)
    return response.data
  },

  async getToday(): Promise<ApiResponse<Attendance | null>> {
    const response = await apiClient.get('/attendance/today')
    return response.data
  },

  async getHistory(params: {
    page?: number
    per_page?: number
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<Attendance>> {
    const response = await apiClient.get('/attendance/history', { params })
    return response.data
  },

  async getSummary(params: {
    start_date: string
    end_date: string
  }): Promise<ApiResponse<AttendanceSummary>> {
    const response = await apiClient.get('/attendance/summary', { params })
    return response.data
  },
}
```

- [ ] **Step 3: Create employees.service.ts**

```typescript
import apiClient from './axios'
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const employeesService = {
  async list(params?: {
    page?: number
    per_page?: number
    search?: string
    department_id?: number
  }): Promise<PaginatedResponse<Employee>> {
    const response = await apiClient.get('/employees', { params })
    return response.data
  },

  async get(id: number): Promise<ApiResponse<Employee>> {
    const response = await apiClient.get(`/employees/${id}`)
    return response.data
  },

  async create(data: CreateEmployee): Promise<ApiResponse<Employee>> {
    const response = await apiClient.post('/employees', data)
    return response.data
  },

  async update(id: number, data: UpdateEmployee): Promise<ApiResponse<Employee>> {
    const response = await apiClient.put(`/employees/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/employees/${id}`)
  },

  async search(query: string): Promise<ApiResponse<Employee[]>> {
    const response = await apiClient.get('/employees/search', { params: { q: query } })
    return response.data
  },
}
```

- [ ] **Step 4: Create payroll.service.ts**

```typescript
import apiClient from './axios'
import type { Payroll, PayrollItem, DeductionItem } from '@/types/payroll'
import type { ApiResponse, PaginatedResponse } from '@/types/auth'

export const payrollService = {
  async list(params?: {
    page?: number
    per_page?: number
    month?: number
    year?: number
    status?: string
  }): Promise<PaginatedResponse<Payroll>> {
    const response = await apiClient.get('/payroll', { params })
    return response.data
  },

  async get(id: number): Promise<ApiResponse<Payroll>> {
    const response = await apiClient.get(`/payroll/${id}`)
    return response.data
  },

  async calculate(employeeId: number, month: number, year: number): Promise<ApiResponse<{
    payroll: Payroll
    items: PayrollItem[]
    deductions: DeductionItem[]
  }>> {
    const response = await apiClient.post('/payroll/calculate', { employee_id: employeeId, month, year })
    return response.data
  },

  async approve(id: number): Promise<ApiResponse<Payroll>> {
    const response = await apiClient.post(`/payroll/${id}/approve`)
    return response.data
  },

  async getReport(params: {
    month: number
    year: number
    department_id?: number
  }): Promise<ApiResponse<Payroll[]>> {
    const response = await apiClient.get('/payroll/report', { params })
    return response.data
  },
}
```

- [ ] **Step 5: Create settings.service.ts**

```typescript
import apiClient from './axios'
import type { AppSettings, NotificationSettings, WorkSchedule } from '@/types/settings'
import type { GeofenceLocation } from '@/types/geofence'
import type { ApiResponse } from '@/types/auth'

export const settingsService = {
  async getAppSettings(): Promise<ApiResponse<AppSettings>> {
    const response = await apiClient.get('/settings/app')
    return response.data
  },

  async updateAppSettings(data: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    const response = await apiClient.put('/settings/app', data)
    return response.data
  },

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.get('/settings/notifications')
    return response.data
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.put('/settings/notifications', data)
    return response.data
  },

  async getWorkSchedule(): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await apiClient.get('/settings/schedule')
    return response.data
  },

  async updateWorkSchedule(data: WorkSchedule[]): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await apiClient.put('/settings/schedule', { schedule: data })
    return response.data
  },

  async getGeofences(): Promise<ApiResponse<GeofenceLocation[]>> {
    const response = await apiClient.get('/settings/geofences')
    return response.data
  },

  async createGeofence(data: Omit<GeofenceLocation, 'office_id'>): Promise<ApiResponse<GeofenceLocation>> {
    const response = await apiClient.post('/settings/geofences', data)
    return response.data
  },

  async updateGeofence(id: number, data: Partial<GeofenceLocation>): Promise<ApiResponse<GeofenceLocation>> {
    const response = await apiClient.put(`/settings/geofences/${id}`, data)
    return response.data
  },

  async deleteGeofence(id: number): Promise<void> {
    await apiClient.delete(`/settings/geofences/${id}`)
  },
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/api/
git commit -m "feat(api): add domain service modules with typed responses"
```

---

## Task 5: Create Pinia Stores

**Files:**
- Create: `frontend/src/store/attendance.ts`
- Create: `frontend/src/store/employees.ts`
- Create: `frontend/src/store/payroll.ts`
- Create: `frontend/src/store/profile.ts`
- Create: `frontend/src/store/notifications.ts`
- Create: `frontend/src/store/ui.ts`

- [ ] **Step 1: Create attendance.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { attendanceService } from '@/api/attendance.service'
import type { Attendance, ClockInRequest, ClockOutRequest } from '@/types/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  const todayAttendance = ref<Attendance | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function clockIn(data: ClockInRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await attendanceService.clockIn(data)
      todayAttendance.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Clock in failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function clockOut(data: ClockOutRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await attendanceService.clockOut(data)
      todayAttendance.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Clock out failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchToday() {
    isLoading.value = true
    try {
      const response = await attendanceService.getToday()
      todayAttendance.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    todayAttendance.value = null
    error.value = null
  }

  return {
    todayAttendance,
    isLoading,
    error,
    clockIn,
    clockOut,
    fetchToday,
    clear,
  }
})
```

- [ ] **Step 2: Create employees.ts**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { employeesService } from '@/api/employees.service'
import type { Employee, CreateEmployee, UpdateEmployee } from '@/types/employee'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const selectedEmployee = ref<Employee | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const filters = ref({
    search: '',
    department_id: null as number | null,
  })

  const hasMore = computed(() => pagination.value.current_page < pagination.value.last_page)

  async function fetchEmployees(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await employeesService.list({
        page,
        per_page: pagination.value.per_page,
        search: filters.value.search || undefined,
        department_id: filters.value.department_id || undefined,
      })
      employees.value = page === 1 ? response.data : [...employees.value, ...response.data]
      pagination.value = response.meta
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch employees'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEmployee(id: number) {
    isLoading.value = true
    try {
      const response = await employeesService.get(id)
      selectedEmployee.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(data: CreateEmployee) {
    isLoading.value = true
    try {
      const response = await employeesService.create(data)
      employees.value.unshift(response.data)
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to create employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateEmployee(id: number, data: UpdateEmployee) {
    isLoading.value = true
    try {
      const response = await employeesService.update(id, data)
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) employees.value[index] = response.data
      if (selectedEmployee.value?.id === id) selectedEmployee.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to update employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEmployee(id: number) {
    isLoading.value = true
    try {
      await employeesService.delete(id)
      employees.value = employees.value.filter(e => e.id !== id)
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to delete employee'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clear() {
    employees.value = []
    selectedEmployee.value = null
    pagination.value = { current_page: 1, last_page: 1, per_page: 15, total: 0 }
    filters.value = { search: '', department_id: null }
  }

  return {
    employees,
    selectedEmployee,
    isLoading,
    error,
    pagination,
    filters,
    hasMore,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setFilters,
    clear,
  }
})
```

- [ ] **Step 3: Create payroll.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { payrollService } from '@/api/payroll.service'
import type { Payroll } from '@/types/payroll'

export const usePayrollStore = defineStore('payroll', () => {
  const payrolls = ref<Payroll[]>([])
  const selectedPayroll = ref<Payroll | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })
  const filters = ref({
    month: null as number | null,
    year: null as number | null,
    status: null as string | null,
  })

  async function fetchPayrolls(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await payrollService.list({
        page,
        per_page: pagination.value.per_page,
        month: filters.value.month || undefined,
        year: filters.value.year || undefined,
        status: filters.value.status || undefined,
      })
      payrolls.value = page === 1 ? response.data : [...payrolls.value, ...response.data]
      pagination.value = response.meta
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch payroll'
    } finally {
      isLoading.value = false
    }
  }

  async function approvePayroll(id: number) {
    isLoading.value = true
    try {
      const response = await payrollService.approve(id)
      const index = payrolls.value.findIndex(p => p.id === id)
      if (index !== -1) payrolls.value[index] = response.data
      if (selectedPayroll.value?.id === id) selectedPayroll.value = response.data
      return { success: true }
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to approve payroll'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clear() {
    payrolls.value = []
    selectedPayroll.value = null
    pagination.value = { current_page: 1, last_page: 1, per_page: 15, total: 0 }
  }

  return {
    payrolls,
    selectedPayroll,
    isLoading,
    error,
    pagination,
    filters,
    fetchPayrolls,
    approvePayroll,
    setFilters,
    clear,
  }
})
```

- [ ] **Step 4: Create profile.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/api/auth.service'
import type { User } from '@/types/auth'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.getUser()
      profile.value = response.data
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || 'Failed to fetch profile'
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    // Profile update via separate endpoint if needed
    isLoading.value = true
    try {
      // Placeholder for profile update API
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    profile.value = null
    error.value = null
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clear,
  }
})
```

- [ ] **Step 5: Create notifications.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const pushEnabled = ref(false)

  function addNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    notifications.value.unshift({
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    })
    unreadCount.value++
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      if (!notifications.value[index].read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
    notifications.value = []
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    pushEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clear,
  }
})
```

- [ ] **Step 6: Create ui.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const activeModal = ref<string | null>(null)
  const toasts = ref<Toast[]>([])
  const globalLoading = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function openModal(modalId: string) {
    activeModal.value = modalId
  }

  function closeModal() {
    activeModal.value = null
  }

  function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  return {
    sidebarCollapsed,
    activeModal,
    toasts,
    globalLoading,
    toggleSidebar,
    openModal,
    closeModal,
    showToast,
    dismissToast,
    setGlobalLoading,
  }
})
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/store/
git commit -m "feat(stores): add domain stores for attendance, employees, payroll, profile, notifications, ui"
```

---

## Task 6: Delete Scaffold Files

**Files:**
- Delete: `frontend/src/components/HelloWorld.vue`
- Delete: `frontend/src/components/TheWelcome.vue`
- Delete: `frontend/src/components/WelcomeItem.vue`
- Delete: `frontend/src/components/icons/IconCommunity.vue`
- Delete: `frontend/src/components/icons/IconDocumentation.vue`
- Delete: `frontend/src/components/icons/IconEcosystem.vue`
- Delete: `frontend/src/components/icons/IconSupport.vue`
- Delete: `frontend/src/components/icons/IconTooling.vue`
- Delete: `frontend/src/main-admin.ts`
- Delete: `frontend/src/main-employee.ts`

- [ ] **Step 1: Delete scaffold files**

Run:
```powershell
Remove-Item frontend/src/components/HelloWorld.vue
Remove-Item frontend/src/components/TheWelcome.vue
Remove-Item frontend/src/components/WelcomeItem.vue
Remove-Item frontend/src/components/icons/IconCommunity.vue
Remove-Item frontend/src/components/icons/IconDocumentation.vue
Remove-Item frontend/src/components/icons/IconEcosystem.vue
Remove-Item frontend/src/components/icons/IconSupport.vue
Remove-Item frontend/src/components/icons/IconTooling.vue
Remove-Item frontend/src/main-admin.ts
Remove-Item frontend/src/main-employee.ts
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove Vue CLI scaffold leftovers and dead entry points"
```

---

## Task 7: Update Entry Points

**Files:**
- Modify: `frontend/admin/main.ts`
- Modify: `frontend/employee/main.ts`

- [ ] **Step 1: Create shared main.ts in src/**

```typescript
import 'leaflet/dist/leaflet.css'
import './assets/base.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useTheme } from './composables/useTheme'
import type { Router } from 'vue-router'

export function createAppInstance(router: Router) {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  useTheme().init()

  return app
}
```

- [ ] **Step 2: Update admin/main.ts**

```typescript
import { createAppInstance } from '../src/main'
import adminRouter from '../src/router/admin'

const app = createAppInstance(adminRouter)
app.mount('#app')
```

- [ ] **Step 3: Update employee/main.ts**

```typescript
import { createAppInstance } from '../src/main'
import employeeRouter from '../src/router/employee'

const app = createAppInstance(employeeRouter)
app.mount('#app')
```

- [ ] **Step 4: Run build to verify**

Run: `cd frontend && npm run build:admin`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add frontend/src/main.ts frontend/admin/main.ts frontend/employee/main.ts
git commit -m "refactor: create shared bootstrap with flexible router injection"
```

---

## Task 8: Decompose admin/EmployeesPage.vue

**Files:**
- Modify: `frontend/src/pages/admin/EmployeesPage.vue`
- Create: `frontend/src/components/admin/employees/EmployeeList.vue`
- Create: `frontend/src/components/admin/employees/EmployeeFilters.vue`
- Create: `frontend/src/components/admin/employees/EmployeeForm.vue`
- Create: `frontend/src/components/admin/employees/EmployeeDetail.vue`

- [ ] **Step 1: Read EmployeesPage.vue**

Note current structure and logic to extract

- [ ] **Step 2: Create EmployeeFilters.vue**

```typescript
// Components for filtering/searching employees
// Uses useEmployeesStore().setFilters()
```

- [ ] **Step 3: Create EmployeeList.vue**

```typescript
// Table component consuming employees store
// Handles pagination, loading states
```

- [ ] **Step 4: Create EmployeeForm.vue**

```typescript
// Modal/drawer for create/edit employee
// Uses useEmployeesStore().createEmployee/updateEmployee
```

- [ ] **Step 5: Create EmployeeDetail.vue**

```typescript
// Sidebar/panel for viewing employee details
```

- [ ] **Step 6: Refactor EmployeesPage.vue**

```vue
<script setup lang="ts">
// Import child components
// Import and use useEmployeesStore
// Remove all inline logic
// Page should be < 100 lines
</script>

<template>
  <div class="employees-page">
    <EmployeeFilters @search="handleSearch" />
    <EmployeeList />
    <EmployeeForm />
    <EmployeeDetail />
  </div>
</template>
```

- [ ] **Step 7: Run lint and build**

Run: `cd frontend && npm run lint && npm run build:admin`
Expected: No errors, build succeeds

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/admin/EmployeesPage.vue frontend/src/components/admin/employees/
git commit -m "refactor(EmployeesPage): extract into smart container components"
```

---

## Implementation Order

| Task | Description | Estimated Time |
|------|-------------|-----------------|
| 1 | Extend auth store | 5 min |
| 2 | Fix Axios interceptor | 5 min |
| 3 | Create type files | 10 min |
| 4 | Create API services | 15 min |
| 5 | Create Pinia stores | 20 min |
| 6 | Delete scaffold files | 2 min |
| 7 | Update entry points | 5 min |
| 8 | Decompose EmployeesPage (example) | 20 min |

---

## Success Criteria

- [ ] All 9 pages decomposed to < 200 lines each
- [ ] Each page has dedicated Pinia store
- [ ] API services return typed responses
- [ ] Auth interceptor uses authStore (not hardcoded paths)
- [ ] Zero dead code / scaffold files
- [ ] Entry points consolidated to 3 files max
- [ ] All components are testable in isolation

---

**Plan complete.**