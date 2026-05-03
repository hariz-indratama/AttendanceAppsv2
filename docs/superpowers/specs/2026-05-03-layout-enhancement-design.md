# Layout Enhancement Design — Admin & Employee PWA

**Date:** 2026-05-03
**Status:** Approved

---

## 1. Overview

Two independent layout systems for the attendance app:

- **Admin** — desktop-first web dashboard with a fixed sidebar, sticky header, CSS-variable-based design tokens. All pages get a systematic polish pass.
- **Employee** — mobile-first PWA with a light theme, bottom tab bar navigation, isolated scoped CSS tokens. A new `EmployeeLayout` wraps all employee routes.

---

## 2. Admin Layout Enhancement

### 2.1 Shell (already implemented)

- Fixed left sidebar (240px), collapses to icon-only at ≤1024px
- Sticky top header (60px) with page title + header-actions slot
- `#0a0f1a` page background, scrollable content area

### 2.2 Design Token Migration

All admin pages (`DashboardPage`, `EmployeesPage`, `AttendancePage`, `PayrollPage`, `ReportsPage`, `SettingsPage`) must use CSS variables only — no Tailwind utility classes for colors, backgrounds, or shadows.

**Token set:**

```css
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
--admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
--admin-radius: 1rem;
```

### 2.3 Component Enhancements

| Component | Enhancement |
|---|---|
| `AdminTable.vue` | Div-based rows with hover state, responsive overflow scroll |
| `AdminEmptyState.vue` | Inline SVG icon + descriptive message + optional action button |
| `AdminCard.vue` | Stays, apply CSS token radius and shadow |
| Skeleton loaders | New `AdminSkeleton.vue` — shimmer animation matching card geometry |

### 2.4 Page-Level Polish

Each page receives:
1. Replace all Tailwind color/shadow classes with CSS token variables in `<style scoped>`
2. Add skeleton loader variants for loading states
3. Ensure empty states match the enhanced `AdminEmptyState` pattern
4. Consistent 4-column KPI grid using `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`
5. Status badge: consistent color mapping across all pages
6. Unified pagination bar component

---

## 3. Employee PWA Layout

### 3.1 New Files

| File | Purpose |
|---|---|
| `frontend/src/layouts/EmployeeLayout.vue` | Shell with top bar + bottom tab bar + `<router-view>` |
| `frontend/src/components/employee/EmployeeTabBar.vue` | Bottom navigation with 5 tabs |
| `frontend/src/components/employee/EmployeeCard.vue` | Reusable card with token styles |
| `frontend/src/components/employee/EmployeeBadge.vue` | Status badge component |
| `frontend/src/components/employee/EmployeeSkeleton.vue` | Skeleton loader for lists and cards |

### 3.2 Layout Structure

```
┌────────────────────────────────────┐
│ [avatar+name]       [notif bell]  │  ← top header bar (fixed, 56px)
│───────────────────────────────────│
│                                    │
│         <router-view />           │  ← scrollable content
│                                    │
│                                    │
│───────────────────────────────────│
│ [Clock] [Dashboard] [History]      │  ← bottom tab bar (fixed, 64px)
│          [Profile] [Settings]     │
└────────────────────────────────────┘
```

**Top header:** 56px fixed, contains avatar (initials) + employee name on left, notification bell icon on right.

**Bottom tab bar:** 64px fixed, 5 evenly-spaced icon+label tabs. Active tab has indigo underline + active icon color. `env(safe-area-inset-bottom)` padding for notched devices.

**Content padding:** `padding-bottom: calc(64px + env(safe-area-inset-bottom))` to prevent scroll overlap.

### 3.3 Employee Design Tokens (scoped to EmployeeLayout)

```css
--emp-bg: #f8fafc;
--emp-card: #ffffff;
--emp-border: #e2e8f0;
--emp-text: #0f172a;
--emp-text-secondary: #64748b;
--emp-text-muted: #cbd5e1;
--emp-accent: #6366f1;
--emp-accent-muted: rgba(99, 102, 241, 0.08);
--emp-accent-light: rgba(99, 102, 241, 0.12);
--emp-success: #10b981;
--emp-danger: #ef4444;
--emp-warning: #f59e0b;
--emp-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
--emp-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
--emp-radius: 1rem;
--emp-font-display: 'Syne', system-ui, sans-serif;
--emp-font-body: 'DM Sans', system-ui, sans-serif;
```

### 3.4 Employee Pages

| Page | Key Components | Notes |
|---|---|---|
| `ClockPage.vue` | Already done — keep as-is | Current amber/dark aesthetic stays |
| `DashboardPage.vue` | KPI row (hours, streak, status) + recent activity list | New card-based layout using EmployeeCard |
| `HistoryPage.vue` | Date filter + paginated attendance list | Date picker + empty state |
| `ProfilePage.vue` | Avatar, name/email, role badge, edit form | Inline edit with save button |
| `SettingsPage.vue` | Grouped preference toggles | Display, Notifications, Security sections |

Sub-pages (`DisplaySettings`, `NotificationSettings`, `SecuritySettings`) remain as standalone pages accessible from Settings.

---

## 4. Router Changes

Add employee route group with `EmployeeLayout` wrapper:

```ts
{
  path: '/employee',
  component: () => import('@/layouts/EmployeeLayout.vue'),
  meta: { requiresAuth: true, role: 'employee' },
  children: [
    { path: '', name: 'employee-dashboard', component: () => import('@/pages/employee/DashboardPage.vue') },
    { path: 'clock', name: 'employee-clock', component: () => import('@/pages/employee/ClockPage.vue') },
    { path: 'history', name: 'employee-history', component: () => import('@/pages/employee/HistoryPage.vue') },
    { path: 'profile', name: 'employee-profile', component: () => import('@/pages/employee/ProfilePage.vue') },
    { path: 'settings', name: 'employee-settings', component: () => import('@/pages/employee/SettingsPage.vue') },
    { path: 'settings/display', name: 'employee-display-settings', component: () => import('@/pages/employee/DisplaySettings.vue') },
    { path: 'settings/notifications', name: 'employee-notif-settings', component: () => import('@/pages/employee/NotificationSettings.vue') },
    { path: 'settings/security', name: 'employee-security-settings', component: () => import('@/pages/employee/SecuritySettings.vue') },
  ],
},
```

Auth guard: redirect to `/login` if unauthenticated employee tries to access `/employee/*`.

---

## 5. File Summary

**New files:**
- `frontend/src/layouts/EmployeeLayout.vue`
- `frontend/src/components/employee/EmployeeTabBar.vue`
- `frontend/src/components/employee/EmployeeCard.vue`
- `frontend/src/components/employee/EmployeeBadge.vue`
- `frontend/src/components/employee/EmployeeSkeleton.vue`

**Modified files:**
- `frontend/src/router/index.ts` — add employee route group
- `frontend/src/pages/employee/DashboardPage.vue` — redesign with EmployeeCard
- `frontend/src/pages/employee/HistoryPage.vue` — redesign with EmployeeCard + date filter
- `frontend/src/pages/employee/ProfilePage.vue` — redesign with EmployeeCard
- `frontend/src/pages/employee/SettingsPage.vue` — redesign with grouped toggles
- `frontend/src/pages/admin/EmployeesPage.vue` — CSS variable migration
- `frontend/src/pages/admin/AttendancePage.vue` — CSS variable migration
- `frontend/src/pages/admin/PayrollPage.vue` — CSS variable migration
- `frontend/src/pages/admin/ReportsPage.vue` — CSS variable migration
- `frontend/src/pages/admin/SettingsPage.vue` — CSS variable migration
- `frontend/src/components/admin/AdminTable.vue` — enhance with hover + responsive overflow
- `frontend/src/components/admin/AdminEmptyState.vue` — enhance with SVG icon + action button

**No changes needed:**
- `frontend/src/pages/employee/ClockPage.vue` — already complete
- `frontend/src/pages/employee/DisplaySettings.vue` — standalone, add EmployeeCard wrapper
- `frontend/src/pages/employee/NotificationSettings.vue` — standalone, add EmployeeCard wrapper
- `frontend/src/pages/employee/SecuritySettings.vue` — standalone, add EmployeeCard wrapper