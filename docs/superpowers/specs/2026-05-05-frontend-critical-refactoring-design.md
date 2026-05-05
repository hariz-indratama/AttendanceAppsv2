# Frontend Critical Refactoring — Spec 1

> **Project**: Attendance App v4 Frontend Refactoring
> **Scope**: Critical Priority — Page Decomposition + Entry Points
> **Date**: 2026-05-05

---

## 1. Overview

Refactor the Vue 3 frontend to improve maintainability, testability, and code organization. This spec covers Critical Priority issues identified in `frontend_analysis.md`.

**Goals:**
- Decompose 9 monolithic pages (500-900 lines) into smart container + child components
- Clean up duplicate/dead entry point files
- Fix hardcoded auth redirect in Axios interceptor

---

## 2. Architecture

### 2.1 Entry Point Structure

```
frontend/
├── src/
│   └── main.ts                    # Shared bootstrap (keeps)
│       ├── initializes Pinia
│       ├── imports App.vue
│       └── exports for override
├── admin/
│   ├── index.html
│   └── main.ts                    # Imports src/main.ts, injects admin router
└── employee/
    ├── index.html
    └── main.ts                    # Imports src/main.ts, injects employee router
```

**Files to DELETE:**
- `src/main-admin.ts`
- `src/main-employee.ts`

**Files to KEEP:**
- `admin/main.ts` (modified to import from src/main.ts)
- `employee/main.ts` (modified to import from src/main.ts)

### 2.2 Page Decomposition Pattern

```
src/pages/admin/SettingsPage.vue         # Orchestrator (< 100 lines)
└── components/admin/settings/
     ├── GeneralSettings.vue             # Smart container
     ├── GeofenceSettings.vue            # Smart container
     ├── WorkScheduleSettings.vue        # Smart container
     ├── NotificationSettings.vue        # Smart container
     └── SecuritySettings.vue            # Smart container
```

**Rules:**
1. Orchestrator pages handle layout only, no API calls
2. Child components are "smart containers" — manage their own state via stores
3. Each child component has a dedicated Pinia store
4. Components communicate through store actions, not props/emits for complex data

---

## 3. Pages to Decompose

| Page | Child Components | New Store |
|------|-----------------|-----------|
| `admin/SettingsPage.vue` (947 lines) | GeneralSettings, GeofenceSettings, WorkScheduleSettings, NotificationSettings, SecuritySettings | settings.ts |
| `employee/ProfilePage.vue` (918 lines) | PersonalInfo, AvatarUpload, PasswordChange, SessionHistory | profile.ts |
| `employee/ClockPage.vue` (872 lines) | ClockButton, StatusDisplay, LocationCheck, BiometricPrompt | attendance.ts |
| `admin/EmployeesPage.vue` (717 lines) | EmployeeList, EmployeeFilters, EmployeeForm, EmployeeDetail | employees.ts |
| `admin/AdminLoginPage.vue` (702 lines) | LoginForm, RememberMeToggle, ForgotPasswordLink | auth.ts (extend) |
| `employee/HistoryPage.vue` (699 lines) | HistoryList, HistoryFilters, HistoryDetail | attendance.ts |
| `admin/PayrollPage.vue` (698 lines) | PayrollTable, PayrollFilters, PayrollDetail, PayrollExport | payroll.ts |
| `employee/SettingsPage.vue` (685 lines) | DisplaySettings, NotificationSettings, SecuritySettings | settings.ts |
| `admin/AttendancePage.vue` (645 lines) | AttendanceTable, AttendanceFilters, AttendanceDetail | attendance.ts |

---

## 4. Store Organization

```
src/store/
├── auth.ts           # EXTEND — add loginPath + redirectPath
├── attendance.ts     # NEW — clockIn/Out, today status, history, filters
├── employees.ts      # NEW — list, pagination, filters, CRUD
├── payroll.ts        # NEW — payroll data, calculations, reports
├── profile.ts        # NEW — user profile data, avatar upload
├── notifications.ts  # NEW — push notification state, preferences
└── ui.ts             # NEW — sidebar, modals, toasts, loading states
```

### 4.1 Auth Store Extension

```typescript
interface AuthState {
  token: string | null
  user: User | null
  loginPath: string          // NEW: for interceptor redirect
  redirectPath: string      // NEW: for post-login redirect
}
```

---

## 5. API Service Layer

```
src/api/
├── axios.ts              # UPDATED — auth interceptor uses authStore
├── auth.service.ts       # login, logout, refresh, register
├── attendance.service.ts # clockIn, clockOut, getHistory, getByDateRange
├── employees.service.ts  # list, create, update, delete, search
├── payroll.service.ts     # calculate, approve, getReports
└── settings.service.ts    # getSettings, updateSettings
```

**Rule:** Services are internal to stores. Components never call services directly.

---

## 6. Type File Reorganization

```
src/types/
├── api.ts              # ApiResponse<T>, PaginatedResponse<T>
├── auth.ts             # User, LoginCredentials, TokenResponse (keep)
├── attendance.ts      # Attendance, ClockInRequest, ClockOutRequest
├── employee.ts         # Employee, CreateEmployee, UpdateEmployee
├── payroll.ts          # Payroll, PayrollItem, DeductionItem
├── leave.ts            # LeaveRequest, LeaveBalance
├── geofence.ts         # GeofenceLocation, GeofenceCheckResult
└── settings.ts         # AppSettings, NotificationSettings
```

**Rule:** Each API service imports its domain types. Every API response has a corresponding type/interface.

---

## 7. Component Communication Flow

```
Component
  └── calls → Store action
  └── reads → Store state

Store
  └── calls → Service method
  └── receives → typed response
  └── updates → reactive state
  └── triggers → UI updates

Axios Interceptor (401)
  └── reads → authStore.loginPath
  └── saves → authStore.redirectPath (current route)
  └── navigates → authStore.loginPath
```

---

## 8. Files to Delete

```
src/components/HelloWorld.vue
src/components/TheWelcome.vue
src/components/WelcomeItem.vue
src/components/icons/IconCommunity.vue
src/components/icons/IconDocumentation.vue
src/components/icons/IconEcosystem.vue
src/components/icons/IconSupport.vue
src/components/icons/IconTooling.vue
src/main-admin.ts
src/main-employee.ts
```

---

## 9. Implementation Order

1. **Phase 1:** Update auth store + fix Axios interceptor
2. **Phase 2:** Create new stores (attendance, employees, payroll, profile, notifications, ui)
3. **Phase 3:** Create API services with types
4. **Phase 4:** Reorganize types directory
5. **Phase 5:** Decompose pages (start with admin/EmployeesPage.vue as smallest)
6. **Phase 6:** Delete scaffold files + dead entry points
7. **Phase 7:** Update admin/employee entry points to use shared main.ts

---

## 10. Success Criteria

- [ ] All 9 pages decomposed to < 200 lines each
- [ ] Each page has dedicated Pinia store
- [ ] API services return typed responses
- [ ] Auth interceptor uses authStore (not hardcoded paths)
- [ ] Zero dead code / scaffold files
- [ ] Entry points consolidated to 3 files max
- [ ] All components are testable in isolation