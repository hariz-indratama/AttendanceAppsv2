# Attendance App — Remaining Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 8 remaining pages per the design spec dated 2026-05-02. All pages are skeleton stubs — add full UI, state management, and API integration.

**Architecture:** Each page is a self-contained Vue 3 component driven by Pinia stores. Admin pages use `AdminLayout.vue`; employee pages use `EmployeeLayout.vue`. API calls go through `src/api/axios.ts`. Types are already defined in `src/types/auth.ts`.

**Tech Stack:** Vue 3 + TypeScript + Tailwind CSS + Native SVG icons (no shadcn installed yet). `xlsx` and `jspdf` will be added for export features.

---

## Shared Patterns

All pages follow this structure:
1. `<script setup lang="ts">` with typed refs, computed props, `onMounted` API fetch
2. Loading skeleton using Tailwind `animate-pulse`
3. Error/success toasts with auto-dismiss
4. Responsive card layout: `bg-white rounded-2xl shadow-lg border border-gray-100 p-6`

**Standard loading skeleton (copy into each page):**
```vue
<div v-if="isLoading" class="space-y-4">
  <div class="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
  <div class="grid grid-cols-2 gap-4">
    <div class="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
    <div class="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
  </div>
</div>
```

**Standard card wrapper:**
```vue
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
  <!-- content -->
</div>
```

---

## File Map

| Page | File | Layout |
|------|------|--------|
| Admin Dashboard | `frontend/src/pages/admin/DashboardPage.vue` | Tabbed |
| Admin Employees | `frontend/src/pages/admin/EmployeesPage.vue` | Table + Sheet |
| Admin Attendance | `frontend/src/pages/admin/AttendancePage.vue` | Sortable table |
| Admin Payroll | `frontend/src/pages/admin/PayrollPage.vue` | All-in-one hub |
| Admin Reports | `frontend/src/pages/admin/ReportsPage.vue` | Date range + PDF |
| Admin Settings | `frontend/src/pages/admin/SettingsPage.vue` | Form |
| Employee Profile | `frontend/src/pages/employee/ProfilePage.vue` | Header + Tabs |
| Employee History | `frontend/src/pages/employee/HistoryPage.vue` | Calendar |

---

## Task 1: Admin Dashboard — `DashboardPage.vue`

**File:** `frontend/src/pages/admin/DashboardPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/dashboard/stats` → returns `{ present_today, late_today, absent_today, total_hours_today }`
- `GET /api/admin/employees?per_page=10` → returns paginated users
- `GET /api/admin/attendance/today` → returns today's attendance log

**Layout:** Three tabs — Overview (KPIs), Employees (table), Activity (live log)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/axios'

// State
const activeTab = ref<'overview' | 'employees' | 'activity'>('overview')
const isLoading = ref(true)
const stats = ref({ present: 0, late: 0, absent: 0, totalHours: 0 })
const recentEmployees = ref<Array<{ id: number; name: string; email: string; role: string }>>([])
const todayActivity = ref<Array<{ id: number; user_name: string; clock_in: string; status: string }>>([])

onMounted(async () => {
  await Promise.all([fetchStats(), fetchEmployees(), fetchTodayActivity()])
  isLoading.value = false
})

async function fetchStats() {
  try {
    const res = await apiClient.get('/api/admin/dashboard/stats')
    stats.value = res.data.data
  } catch { /* use defaults */ }
}

async function fetchEmployees() {
  try {
    const res = await apiClient.get('/api/admin/employees?per_page=10')
    recentEmployees.value = res.data.data
  } catch { /* empty */ }
}

async function fetchTodayActivity() {
  try {
    const res = await apiClient.get('/api/admin/attendance/today')
    todayActivity.value = res.data.data
  } catch { /* empty */ }
}
</script>
```

### Steps

- [ ] **Step 1: Write DashboardPage.vue** — Replace the stub file with full tabbed layout. Tab buttons at top with underline indicator. Each tab content conditionally rendered with `v-show` or `<KeepAlive>`.

- [ ] **Step 2: Add Overview tab content** — 4 KPI cards in a 2×2 grid. Cards show: Present (green), Late (yellow), Absent (red), Total Hours (indigo). Use the `CardKPI` pattern.

- [ ] **Step 3: Add Employees tab content** — Compact table listing first 10 employees (name, email, role badge). Link to full employees page.

- [ ] **Step 4: Add Activity tab content** — Real-time log. Auto-refresh every 30s using `setInterval`. Show avatar initial, name, clock-in time, status badge.

- [ ] **Step 5: Test** — Run `npm run dev`, navigate to `/admin`. Verify all 3 tabs render. Confirm loading skeletons appear during fetch and data appears after.

---

## Task 2: Admin Employees — `EmployeesPage.vue`

**File:** `frontend/src/pages/admin/EmployeesPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/employees?search=&page=` → paginated list
- `POST /api/admin/employees` → create employee
- `PUT /api/admin/employees/:id` → update employee
- `DELETE /api/admin/employees/:id` → remove employee

**Layout:** Search bar → data table → slide-over panel for add/edit

**Slide-over panel** (inline, no shadcn dependency):
```vue
<!-- Slide-over: position fixed, right-0, w-96, full height, shadow-2xl -->
<!-- Toggle with v-model="isPanelOpen" -->
<!-- Form fields: name (text), email (email), password (password), role (select) -->
```

### Steps

- [ ] **Step 1: Write EmployeesPage.vue** — Search input at top, table below. Columns: checkbox, Name+Email (stacked), Role (badge), Status (dot + text), Actions (edit icon, delete icon). Pagination at bottom.

- [ ] **Step 2: Implement search** — Debounce 400ms, calls API with `?search=query`. Clear button when query present.

- [ ] **Step 3: Implement add/edit panel** — Slide-over from right. Pre-fill when editing (pass `editingEmployee` ref). Form validation: name required, email format, password required only on create. Save button calls POST or PUT.

- [ ] **Step 4: Implement delete** — Inline `confirm()` dialog before calling DELETE API. Optimistic UI: remove row immediately, restore on error.

- [ ] **Step 5: Test** — Add employee → appears in table. Edit name → updates. Delete → removed. Search → filters list.

---

## Task 3: Admin Attendance — `AttendancePage.vue`

**File:** `frontend/src/pages/admin/AttendancePage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/attendance?start_date=&end_date=&status=&user_id=&page=` → paginated

**Layout:** Filter bar (date range + status + employee dropdown) → sortable table

**Date range:** Two date inputs (`type="date"`), defaulting to current month start/end. Status: "all", "present", "late", "absent". Employee dropdown populated from `GET /api/admin/employees`.

**Table sort:** Click column header to sort. Arrow icon indicates direction. Sort state: `{ key: string, order: 'asc' | 'desc' }`. Sort on client for current page; request new page from API for server-side sort.

### Steps

- [ ] **Step 1: Write AttendancePage.vue** — Filter bar (date inputs, status select, employee select, search button). Table below with columns: Employee, Date, Clock In, Clock Out, Total Hours, Status, Actions.

- [ ] **Step 2: Implement filters** — Apply filters on button click. Reset button clears all. Initial load fetches current month.

- [ ] **Step 3: Implement sort** — Add sort state. Sort icon in column headers. Sort `displayedRecords` on client. Request API with sort params on re-fetch.

- [ ] **Step 4: Implement export** — Add "Export CSV" button. Convert records to CSV string, create `Blob`, trigger download as `attendance-export.csv`. Use headers: Employee, Date, Clock In, Clock Out, Total Hours, Status.

- [ ] **Step 5: Test** — Filter by date range → results update. Sort by column → order changes. Export → CSV downloads.

---

## Task 4: Admin Payroll — `PayrollPage.vue`

**File:** `frontend/src/pages/admin/PayrollPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/employees` → for salary config list
- `PUT /api/admin/employees/:id` → update hourly rate
- `POST /api/admin/payroll/generate` → generate payroll for period
- `GET /api/admin/payroll/:user_id/:month/:year` → fetch payslip
- `GET /api/admin/payroll/export/xlsx` → download Excel
- `GET /api/admin/payroll/export/pdf` → download PDF

**Sections:**
1. **Salary Setup** — Table of employees with editable hourly rate. Inline edit: click rate → input appears → save icon. Save calls `PUT /api/admin/employees/:id`.
2. **Process Payroll** — Month/year selector (default current). "Calculate" button. Shows preview table: employee, hours worked, hourly rate, gross, bonuses, deductions, net.
3. **Export** — "Export Excel" and "Export PDF" buttons.

### Steps

- [ ] **Step 1: Write PayrollPage.vue** — Three-section layout. Salary setup at top, process in middle, export at bottom.

- [ ] **Step 2: Salary Setup** — Fetch employees, display in table with hourly rate column. Inline-edit rate with save/cancel. Persist on save.

- [ ] **Step 3: Process Payroll** — Month/year selector. "Calculate" calls `POST /api/admin/payroll/generate` with `{ month, year }`. Preview table shows breakdown. Loading spinner during calculation.

- [ ] **Step 4: Export buttons** — "Export Excel" triggers download via `GET /api/admin/payroll/export/xlsx?month=&year=`. "Export PDF" same for PDF endpoint. Handle empty state: no payroll calculated yet.

- [ ] **Step 5: Test** — Edit hourly rate → persists. Calculate payroll → preview appears with correct numbers. Export buttons → files download.

---

## Task 5: Admin Reports — `ReportsPage.vue`

**File:** `frontend/src/pages/admin/ReportsPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/reports/summary?start_date=&end_date=` → returns `{ monthly_attendance, late_arrivals, overtime }`
- `GET /api/admin/reports/export/pdf?start_date=&end_date=` → PDF download

**Layout:** Date range selector at top → summary cards → data tables → export button

**Summary sections:**
1. Monthly Attendance — table by employee: days present, days late, total hours
2. Late Arrivals — table: employee, date, clock-in time, delay minutes
3. Overtime — table: employee, total overtime hours, rate

### Steps

- [ ] **Step 1: Write ReportsPage.vue** — Date range bar at top, three report sections below. Each section is a card with a heading and data table.

- [ ] **Step 2: Fetch and display reports** — On mount and on date range change, fetch from `/api/admin/reports/summary`. Display in respective tables.

- [ ] **Step 3: Export PDF** — "Export PDF" button downloads via `GET /api/admin/reports/export/pdf?start_date=&end_date=`.

- [ ] **Step 4: Test** — Set date range → all 3 report sections populate. Export PDF → downloads.

---

## Task 6: Admin Settings — `SettingsPage.vue`

**File:** `frontend/src/pages/admin/SettingsPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/admin/settings` → fetch current settings
- `PUT /api/admin/settings` → save settings

**Settings fields:**
- Office Location: latitude (number, -90 to 90), longitude (number, -180 to 180)
- Geofence Radius: radius in meters (number, 10–1000)
- Company Name: text
- Work Hours: start time, end time (time inputs)

### Steps

- [ ] **Step 1: Write SettingsPage.vue** — Form with labelled fields for all settings. Each field in a labeled group. Save button at bottom.

- [ ] **Step 2: Implement fetch/save** — `onMounted` fetches settings and populates form. Save button calls PUT. Show success toast on save.

- [ ] **Step 3: Test** — Navigate to settings → form populated. Change values → save → success toast. Refresh → values persisted.

---

## Task 7: Employee Profile — `ProfilePage.vue`

**File:** `frontend/src/pages/employee/ProfilePage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/attendance/history?per_page=100` → for attendance stats
- `GET /api/auth/user` → user details (already in auth store)

**Layout:** Header card (avatar, name, email, role) + tab bar (Overview / Attendance / Payroll)

**Tabs:**
1. **Overview** — User info card (name, email, role, department, member since). Work stats: hours this month, days worked, late count. Biometric status: enrolled/not enrolled badge (fetch from `GET /api/auth/user` — field `webauthn_enrolled`).
2. **Attendance History** — Compact month view calendar. Days with dots: green (present), yellow (late), red (absent), gray (no record). Tap day → modal/sheet with details.
3. **Payroll Summary** — Last 3 payslips. Card per payslip: period, gross, net, status badge.

### Steps

- [ ] **Step 1: Write ProfilePage.vue** — Header card with avatar circle (initial-based), name, email, role badge. Tab bar with 3 tabs below.

- [ ] **Step 2: Overview tab** — Display user info from `authStore.user`. Calculate stats from attendance history. Show biometric enrollment status.

- [ ] **Step 3: Attendance tab** — Build mini calendar. Current month grid (7 columns). Dots below each day number. Tap day → small modal with clock-in/out times, total hours, status.

- [ ] **Step 4: Payroll tab** — Fetch recent payrolls. Display up to 3 payslip cards. Each card: month/year, gross salary, net salary, status.

- [ ] **Step 5: Test** — Profile page loads with user data. Tabs switch correctly. Attendance calendar shows dots. Payroll cards display.

---

## Task 8: Employee History — `HistoryPage.vue`

**File:** `frontend/src/pages/employee/HistoryPage.vue` (replace existing stub)

**API calls needed:**
- `GET /api/attendance/history?per_page=100` → full attendance log

**Layout:** Month navigator (← Month Year →) → calendar grid → summary stats below

**Calendar:**
- Grid of 7 columns (Sun-Sat headers)
- Each cell: day number, colored dot(s) for status
- Navigation: prev/next month buttons. On nav, recalculate which records fall in that month.

**Summary stats:**
- Days worked this month, total hours, late count for current calendar month

### Steps

- [ ] **Step 1: Write HistoryPage.vue** — Prev/next month navigator centered at top. Calendar grid below. Summary row at bottom.

- [ ] **Step 2: Build calendar logic** — `buildCalendarDays(year, month)` returns array of `{ day: number|null, date: Date|null, attendance: Attendance|null }` for each cell. Handle padding for month start (null cells before day 1) and month end.

- [ ] **Step 3: Render calendar grid** — 7-column grid. Each day cell: number top-left, colored dot below. Null cells are empty/gray. Tap day → side sheet or modal with details (clock-in, clock-out, hours, status).

- [ ] **Step 4: Summary stats** — Calculate from `attendances` filtered to current month. Display: "X days worked · Y hours · Z late arrivals."

- [ ] **Step 5: Test** — Navigate prev/next → calendar updates. Dots appear for days with records. Tap day → detail sheet shows correct data. Summary recalculates per month.

---

## Spec Coverage Check

| Spec Section | Task |
|---|---|
| Dashboard — Overview KPIs | Task 1, Step 2 |
| Dashboard — Employees tab | Task 1, Step 3 |
| Dashboard — Activity tab | Task 1, Step 4 |
| Employees — Table + Search | Task 2 |
| Employees — Add/Edit slide-over | Task 2, Step 3 |
| Employees — Remove with confirm | Task 2, Step 4 |
| Attendance — Sortable table + filters | Task 3 |
| Attendance — CSV export | Task 3, Step 4 |
| Payroll — Salary setup | Task 4, Step 2 |
| Payroll — Monthly processing | Task 4, Step 3 |
| Payroll — Export | Task 4, Step 4 |
| Reports — Summary + PDF export | Task 5 |
| Settings — Geofence config | Task 6 |
| Profile — Header + 3 tabs | Task 7 |
| History — Calendar + month nav | Task 8 |

All spec requirements covered.

---

## Type Consistency

All TypeScript interfaces used across tasks are from `src/types/auth.ts`:
- `User` — employee records
- `Attendance` — attendance records
- `Payroll` — payroll records
- `ApiResponse<T>`, `PaginatedResponse<T>` — API response wrappers

All component props and refs use these types. No new interfaces needed.

---

**Plan complete.** Saving to `docs/superpowers/plans/2026-05-02-attendance-remaining-pages.md`.
