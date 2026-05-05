# Layout Enhancement — Implementation Plan

**Spec:** `2026-05-03-layout-enhancement-design.md`
**Date:** 2026-05-03
**Status:** Planning

---

## Audit Results

### What exists already
- `AdminLayout.vue` — shell (sidebar + header + router-view) ✅
- `AdminSidebar.vue` — full desktop nav with active state ✅
- `AdminTable.vue` — table with skeleton rows ✅ (needs enhancement)
- `AdminEmptyState.vue` — icon + text + CTA slot ✅ (needs SVG enhancement)
- `AdminCard.vue` — card wrapper ✅
- Employee pages all exist and use a dark amber theme with inline CSS tokens
- Admin pages use hardcoded hex colors (no CSS variables yet)
- Router has admin routes but **no employee route group**

### What needs to be created
- `EmployeeLayout.vue` — mobile shell with top bar + bottom tab bar
- 4 employee components: `EmployeeTabBar`, `EmployeeCard`, `EmployeeBadge`, `EmployeeSkeleton`
- Employee route group in router

### What needs migration
- Admin pages: replace hardcoded hex colors with CSS token variables
- Employee pages: move scoped CSS tokens into EmployeeLayout (light theme)
- Enhance AdminTable with hover states + responsive overflow
- Enhance AdminEmptyState with inline SVG icon support

---

## Design Direction

**Admin:** Dark professional — `#0a0f1a` background, emerald accent `#10b981`, slate blue sidebar. "Mission control" feel — dense, information-rich, trustworthy.

**Employee PWA:** Light crisp — `#f8fafc` background, indigo accent `#6366f1`, soft shadows. "iOS-native" feel — friendly, approachable, mobile-first. Typography switches from Syne/DM Mono to Syne/DM Sans (dropping mono for a cleaner read).

**Differentiation:** Admin feels like a Bloomberg terminal (dark, data-forward). Employee feels like a premium iOS app (light, spacious, gentle).

---

## Phase 1: EmployeeLayout + Components

### 1.1 EmployeeLayout.vue (`frontend/src/layouts/EmployeeLayout.vue`)

A full-page shell replacing the old bare page structure:

```
┌────────────────────────────────────┐
│ [●] Hariz                          │  ← 56px fixed top bar
│                                     │
│         <router-view />            │  ← scrollable, padded-bottom
│                                     │
│─────────────────────────────────── │
│ [Clock] [Dashboard] [History]       │  ← 64px fixed bottom tab bar
│          [Profile] [Settings]      │
└────────────────────────────────────┘
```

**Scoped tokens** (light theme):
- Background: `#f8fafc`
- Card: `#ffffff`
- Border: `#e2e8f0`
- Accent: `#6366f1` (indigo)
- Accent muted: `rgba(99,102,241,0.08)`
- Text: `#0f172a` / secondary `#64748b` / muted `#cbd5e1`
- Shadows: soft — `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`
- Radius: `1rem`
- Fonts: `--emp-font-display: 'Syne'`, `--emp-font-body: 'DM Sans'`

**Content padding:** `padding-bottom: calc(64px + env(safe-area-inset-bottom))` to clear the fixed tab bar and notched devices.

**Top bar:** Left side = circular avatar (initials, indigo bg) + employee name. Right side = notification bell icon button.

**Tab bar:** 5 evenly-spaced tabs. Each has an SVG icon + label below. Active tab uses indigo color + an underline indicator. Uses `position: fixed; bottom: 0`.

### 1.2 EmployeeTabBar.vue (`frontend/src/components/employee/EmployeeTabBar.vue`)

Props: `tabs: Array<{ name, path, icon }>`, `activeTab: string`

- 5 tabs: Clock, Dashboard, History, Profile, Settings
- Renders `<router-link>` or `<button>` per tab
- Active underline indicator (2px, indigo, animated)
- Safe area padding bottom
- SVG icons: `Clock` (clock face), `Dashboard` (grid), `History` (calendar), `Profile` (person), `Settings` (gear)

### 1.3 EmployeeCard.vue (`frontend/src/components/employee/EmployeeCard.vue`)

Props: `title?`, `subtitle?`, `action?`, default slot for content.

Renders a white card with:
- `--emp-radius` border-radius (`1rem`)
- `--emp-shadow` box-shadow
- `--emp-border` border
- Optional title/subtitle header section with display font
- Optional action button top-right

### 1.4 EmployeeBadge.vue (`frontend/src/components/employee/EmployeeBadge.vue`)

Props: `status: 'present' | 'late' | 'absent' | 'half_day'`

Renders a pill badge with:
- Indigo for `present` (success green in spec, but light theme prefers indigo)
- Amber for `late`
- Red for `absent`
- Blue for `half_day`

Uses `--emp-accent`, `--emp-success`, `--emp-warning`, `--emp-danger` token values.

### 1.5 EmployeeSkeleton.vue (`frontend/src/components/employee/EmployeeSkeleton.vue`)

Props: `type: 'card' | 'list' | 'avatar'`, `count: number`

- `card` — shimmer card geometry matching EmployeeCard
- `list` — shimmer list item rows
- `avatar` — shimmer circle + lines (profile skeleton)

Shimmer animation using CSS gradient keyframes.

---

## Phase 2: Router Update

Add employee route group with `EmployeeLayout` wrapper. Route `/employee` becomes the authenticated home, redirecting from `/login`.

```ts
{
  path: '/employee',
  component: () => import('@/layouts/EmployeeLayout.vue'),
  meta: { requiresAuth: true, role: 'employee' },
  children: [
    { path: '', name: 'employee-dashboard', component: ... },
    { path: 'clock', name: 'employee-clock', component: ... },
    { path: 'history', name: 'employee-history', component: ... },
    { path: 'profile', name: 'employee-profile', component: ... },
    { path: 'settings', name: 'employee-settings', component: ... },
    { path: 'settings/display', name: 'employee-display-settings', component: ... },
    { path: 'settings/notifications', name: 'employee-notif-settings', component: ... },
    { path: 'settings/security', name: 'employee-security-settings', component: ... },
  ],
},
```

Auth guard: redirect to `/login` if no token.

**Critical path:** Employee pages (`ClockPage`, `DashboardPage`, `HistoryPage`, `ProfilePage`, `SettingsPage`) strip their inline dark CSS variables and rely on EmployeeLayout tokens instead. Content area becomes light-themed.

---

## Phase 3: Admin CSS Variable Migration

Each admin page (Dashboard, Employees, Attendance, Payroll, Reports, Settings) gets a `<style scoped>` scoped token block replacing hardcoded hex values:

```css
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
  --admin-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 16px 32px -4px rgba(0,0,0,0.4);
  --admin-radius: 1rem;
}
```

All hardcoded `#f1f5f9`, `#111827`, `#1e2d45`, etc. in element styles → `var(--admin-text)`, `var(--admin-card)`, etc.

AdminLayout and AdminSidebar also migrate to these CSS variables (they're already close — just need to swap hardcoded hex for token refs).

---

## Phase 4: Admin Component Enhancement

### AdminTable.vue Enhancement
- Add `hover` prop: boolean (default false) — enables `:hover` background on rows
- Add `striped` prop: boolean — alternating row background
- Add `responsive` prop: wraps in `overflow-x: auto` container (already done)
- Skeleton loader: shimmer matching card geometry

### AdminEmptyState.vue Enhancement
- The `icon` prop already accepts a path string — update to accept inline SVG JSX or slot
- Add `action` slot for optional CTA button
- Already has icon wrap with circular bg + border — confirm this matches spec's SVG icon requirement

---

## Phase 5: Page Redesigns

### Employee DashboardPage
- Wrap content in EmployeeLayout
- Replace dark `--bg: #090e1a` with light tokens from EmployeeLayout
- Use EmployeeCard for KPI row (hours, streak, status) + recent activity list
- Staggered entrance animations with `animation-delay` increments

### Employee HistoryPage
- Replace dark theme with light EmployeeLayout tokens
- Calendar grid uses white card with indigo accent for today
- Summary stats use EmployeeCard
- Day detail panel uses light-themed slide-over

### Employee ProfilePage
- Replace dark theme with light tokens
- Avatar ring becomes indigo instead of amber
- Tab bar uses indigo accent
- All cards become white with soft shadows

### Employee SettingsPage
- Replace dark theme with light tokens
- Settings list uses white card styling
- Active sessions card uses light theme

### Admin EmployeesPage, AttendancePage, PayrollPage, ReportsPage, SettingsPage
- Migrate all hardcoded hex to CSS token variables
- Apply consistent card styling with `--admin-radius` and `--admin-shadow`
- Add skeleton loaders where loading state exists

### Admin DashboardPage
- KPI cards in 4-column auto-fill grid
- Tabbed (Overview/Employees/Activity)
- Consistent skeleton loaders

---

## Implementation Order

```
Step 1 — EmployeeLayout.vue (shell, tokens, tab bar slot)
Step 2 — Employee components (TabBar, Card, Badge, Skeleton)
Step 3 — Router update (employee route group + auth guard)
Step 4 — Employee pages migrate to light theme (strip inline tokens, rely on layout)
Step 5 — AdminLayout + AdminSidebar: swap hex → CSS variables
Step 6 — AdminTable + AdminEmptyState enhancements
Step 7 — Admin page migrations (Employees, Attendance, Payroll, Reports, Settings, Dashboard)
Step 8 — Cross-check: fonts loaded, safe-area-inset, animation timing, responsive breakpoints
```

---

## Font Requirements

Check `frontend/index.html` or `main.ts` for font imports:
- Syne — display font ✅ (already in employee pages)
- DM Sans — body font ✅
- DM Mono — mono font (remove from employee pages, keep in admin)

EmployeeLayout imports: Syne + DM Sans (light, clean)
AdminLayout keeps: Syne + DM Sans + DM Mono

---

## Key Files to Modify

| File | Change |
|---|---|
| `frontend/src/layouts/EmployeeLayout.vue` | Create — shell + light tokens |
| `frontend/src/components/employee/EmployeeTabBar.vue` | Create |
| `frontend/src/components/employee/EmployeeCard.vue` | Create |
| `frontend/src/components/employee/EmployeeBadge.vue` | Create |
| `frontend/src/components/employee/EmployeeSkeleton.vue` | Create |
| `frontend/src/router/index.ts` | Add employee route group |
| `frontend/src/layouts/AdminLayout.vue` | Migrate to CSS variables |
| `frontend/src/components/admin/AdminSidebar.vue` | Migrate to CSS variables |
| `frontend/src/components/admin/AdminTable.vue` | Enhance hover + responsive |
| `frontend/src/components/admin/AdminEmptyState.vue` | Enhance SVG + action slot |
| `frontend/src/pages/employee/DashboardPage.vue` | Light theme migration |
| `frontend/src/pages/employee/HistoryPage.vue` | Light theme migration |
| `frontend/src/pages/employee/ProfilePage.vue` | Light theme migration |
| `frontend/src/pages/employee/SettingsPage.vue` | Light theme migration |
| `frontend/src/pages/admin/EmployeesPage.vue` | CSS variable migration |
| `frontend/src/pages/admin/AttendancePage.vue` | CSS variable migration |
| `frontend/src/pages/admin/PayrollPage.vue` | CSS variable migration |
| `frontend/src/pages/admin/ReportsPage.vue` | CSS variable migration |
| `frontend/src/pages/admin/SettingsPage.vue` | CSS variable migration |
| `frontend/src/pages/admin/DashboardPage.vue` | CSS variable migration + tabbed redesign |