# Attendance App — Remaining Pages Design Spec

**Date:** 2026-05-02  
**Status:** Draft

---

## 1. Admin Dashboard — `DashboardPage.vue`

**Layout:** Tabbed sections (Overview / Employees / Activity)

### Overview Tab
- KPI cards: Present count, Late count, Absent count, Total hours logged today
- Compact, scannable at a glance

### Employees Tab
- Paginated table of all employees (name, email, role, status)
- Inline actions: View Profile, Edit

### Activity Tab
- Real-time log of today's clock-in/out events
- Auto-refreshing list

---

## 2. Admin Employees — `EmployeesPage.vue`

**Layout:** Table + Slide-over panel + Confirmation dialog

- **Table:** Data grid with columns: Name, Email, Role, Status, Actions
- **Add Employee:** "Add Employee" button opens a slide-over panel form (name, email, password, role)
- **Edit Employee:** Row action opens same slide-over pre-filled
- **Remove Employee:** Row action shows a confirmation dialog before deleting
- **Search/Filter:** Search by name or email at the top

---

## 3. Admin Attendance — `AttendancePage.vue`

**Layout:** Sortable data table with inline action buttons

- **Table columns:** Employee, Date, Clock In, Clock Out, Total Hours, Status
- **Filters:** Date range picker, status filter (Present/Late/Absent), employee dropdown
- **Inline actions:** View details, flag late arrivals
- **Export:** Button to export filtered results to CSV

---

## 4. Admin Payroll — `PayrollPage.vue`

**Layout:** All-in-One Payroll Hub

- **Salary Setup Section:** Per-employee hourly rate / base salary configuration
- **Monthly Processing:** Select period → auto-calculate from attendance logs → preview
- **Payslip Preview:** Breakdown of hours worked × rate + bonuses − deductions
- **Export:** Buttons to export to Excel (.xlsx) and PDF

---

## 5. Admin Reports — `ReportsPage.vue`

- Summary reports: monthly attendance, late arrivals, overtime
- Date range selector
- Export to PDF

---

## 6. Admin Settings — `SettingsPage.vue`

- Office location configuration (latitude/longitude, radius)
- Geofence settings
- System preferences

---

## 7. Employee Profile — `ProfilePage.vue`

**Layout:** Tabbed Profile (Header Card + Tabs)

- **Header Card:** Avatar (initial-based), name, email, role
- **Tabs:**
  - **Overview:** Personal info, work stats (total hours this month), biometric enrollment status
  - **Attendance History:** Calendar view with color-coded attendance dots per day, tap day for detail
  - **Payroll Summary:** Recent payslip breakdowns

---

## 8. Employee History — `HistoryPage.vue`

**Layout:** Calendar View

- Monthly calendar with color-coded dots per day (green=present, yellow=late, red=absent)
- Tap any day to see clock-in/out details, total hours, status
- Month navigation (prev/next)
- Summary stats below calendar (days worked, total hours this month)

---

## Shared Design Patterns

- Use existing **Tailwind CSS** utilities
- Shadcn/UI components for forms, dialogs, tables
- Consistent card styling: `bg-white rounded-2xl shadow-lg border border-gray-100`
- Loading states with spinners
- Error/success toasts with auto-dismiss
- Responsive mobile-first where applicable

---

## Tech Decisions

- **Excel export:** `xlsx` package
- **PDF export:** `jspdf` + `jspdf-autotable`
- **Calendar:** Custom built with Tailwind grid
- **Slide-over panel:** Shadcn `Sheet` component
- **Data tables:** Shadcn `Table` components with sorting/pagination
- **Confirmation dialog:** Shadcn `AlertDialog` component

---

## Component Map

| Page | File | Layout |
|------|------|--------|
| Admin Dashboard | `pages/admin/DashboardPage.vue` | Tabbed (Overview/Employees/Activity) |
| Admin Employees | `pages/admin/EmployeesPage.vue` | Table + Slide-over + Confirm |
| Admin Attendance | `pages/admin/AttendancePage.vue` | Sortable table + actions |
| Admin Payroll | `pages/admin/PayrollPage.vue` | All-in-One hub |
| Admin Reports | `pages/admin/ReportsPage.vue` | Date range + PDF export |
| Admin Settings | `pages/admin/SettingsPage.vue` | Form-based settings |
| Employee Profile | `pages/employee/ProfilePage.vue` | Header Card + Tabs |
| Employee History | `pages/employee/HistoryPage.vue` | Calendar view |

---

*Spec self-review: All sections complete, no TBD/placeholders, components are specific and implementable.*