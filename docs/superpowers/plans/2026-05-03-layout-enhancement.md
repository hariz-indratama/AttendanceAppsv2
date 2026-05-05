# Layout Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Employee PWA layout shell (top bar + bottom tab bar), create 4 reusable employee components, add the employee route group to the router, and migrate admin pages from Tailwind utility classes to CSS design tokens.

**Architecture:** Employee pages are wrapped in a new `EmployeeLayout.vue` shell that provides a fixed 56px top header bar (with avatar + name + notification bell) and a fixed 64px bottom tab bar with 5 tabs. All employee pages use scoped CSS tokens from `EmployeeLayout`. Admin pages migrate from `text-gray-*`, `bg-indigo-*`, `shadow-*` Tailwind utility classes to CSS variables defined in `base.css` under `.admin-shell`.

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, scoped `<style>`, CSS custom properties, Vue Router 4.

---

## File Map

### New Files
- `frontend/src/layouts/EmployeeLayout.vue` — Shell: top bar + bottom tab bar + `<router-view>`
- `frontend/src/components/employee/EmployeeTabBar.vue` — Fixed 64px bottom nav, 5 icon+label tabs
- `frontend/src/components/employee/EmployeeCard.vue` — Reusable card with token radius/shadow
- `frontend/src/components/employee/EmployeeBadge.vue` — Status badge (present/late/absent/half_day)
- `frontend/src/components/employee/EmployeeSkeleton.vue` — Shimmer skeleton for lists and cards

### Modified Files
- `frontend/src/router/index.ts` — Add `/employee` route group with `EmployeeLayout` wrapper
- `frontend/src/pages/admin/EmployeesPage.vue` — Replace Tailwind color/shadow classes with CSS tokens
- `frontend/src/pages/admin/AttendancePage.vue` — Replace Tailwind classes with CSS tokens
- `frontend/src/pages/admin/PayrollPage.vue` — Replace Tailwind classes with CSS tokens
- `frontend/src/pages/admin/ReportsPage.vue` — Replace Tailwind classes with CSS tokens
- `frontend/src/pages/admin/SettingsPage.vue` — Replace Tailwind classes with CSS tokens
- `frontend/src/components/admin/AdminTable.vue` — Enhance with hover state, responsive overflow
- `frontend/src/components/admin/AdminEmptyState.vue` — Add CTA slot support

---

## Task 1: EmployeeLayout.vue

**Files:**
- Create: `frontend/src/layouts/EmployeeLayout.vue`
- Test: Open `/employee/dashboard` route in browser

- [ ] **Step 1: Write EmployeeLayout.vue**

Create the layout shell with:
- **Top header bar** (56px fixed): left = avatar circle (initials from `authStore`) + employee name; right = notification bell icon button
- **Content area**: `<router-view />` with `padding-bottom: calc(64px + env(safe-area-inset-bottom))`
- **Bottom tab bar** (64px fixed): 5 tabs — Clock (`/employee/clock`), Dashboard (`/employee`), History (`/employee/history`), Profile (`/employee/profile`), Settings (`/employee/settings`)
- Scoped CSS tokens: all `--emp-*` design tokens from the spec
- Active tab: indigo bottom border + active icon color (`--emp-accent`), inactive: muted text
- `env(safe-area-inset-bottom)` padding for notched devices

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import EmployeeTabBar from '@/components/employee/EmployeeTabBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const initials = computed(() => {
  const name = authStore.user?.name ?? 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})
</script>

<template>
  <div class="emp-shell">
    <!-- Top Header Bar -->
    <header class="emp-topbar">
      <div class="emp-topbar__left">
        <div class="emp-topbar__avatar">{{ initials }}</div>
        <span class="emp-topbar__name">{{ authStore.user?.name ?? 'Employee' }}</span>
      </div>
      <button class="emp-topbar__bell" aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    </header>

    <!-- Scrollable Content -->
    <main class="emp-content">
      <router-view />
    </main>

    <!-- Bottom Tab Bar -->
    <EmployeeTabBar />
  </div>
</template>

<style scoped>
/* Design tokens scoped to this layout */
.emp-shell {
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

  min-height: 100dvh;
  background: var(--emp-bg);
  display: flex;
  flex-direction: column;
}

.emp-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: 56px;
  background: var(--emp-card);
  border-bottom: 1px solid var(--emp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  padding-top: env(safe-area-inset-top);
  box-shadow: var(--emp-shadow);
}

.emp-topbar__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.emp-topbar__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--emp-accent-muted);
  border: 1.5px solid var(--emp-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--emp-font-display);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--emp-accent);
  flex-shrink: 0;
}

.emp-topbar__name {
  font-family: var(--emp-font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--emp-text);
}

.emp-topbar__bell {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--emp-text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
  padding: 0;
}

.emp-topbar__bell:hover {
  background: var(--emp-accent-muted);
  color: var(--emp-accent);
}

.emp-topbar__bell svg {
  width: 1.125rem;
  height: 1.125rem;
}

.emp-content {
  flex: 1;
  padding-top: calc(56px + env(safe-area-inset-top));
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: calc(56px + 0.5rem + env(safe-area-inset-top));
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/layouts/EmployeeLayout.vue
git commit -m "feat(employee-layout): create EmployeeLayout shell with topbar and router-view"
```

---

## Task 2: EmployeeTabBar.vue

**Files:**
- Create: `frontend/src/components/employee/EmployeeTabBar.vue`
- Deps: `EmployeeLayout.vue` (Task 1)

- [ ] **Step 1: Write EmployeeTabBar.vue**

Fixed 64px bottom tab bar with 5 tabs. Uses `useRoute()` to determine active tab. Each tab: icon (24px viewBox SVG) + label below.

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  {
    label: 'Clock',
    path: '/employee/clock',
    name: 'employee-clock',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Dashboard',
    path: '/employee',
    name: 'employee-dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'History',
    path: '/employee/history',
    name: 'employee-history',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    label: 'Profile',
    path: '/employee/profile',
    name: 'employee-profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    label: 'Settings',
    path: '/employee/settings',
    name: 'employee-settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

function isActive(tab: typeof tabs[number]) {
  return route.path === tab.path || (route.path.startsWith(tab.path + '/') && tab.path !== '/employee')
}
</script>

<template>
  <nav class="emp-tabbar" aria-label="Main navigation">
    <router-link
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      class="emp-tabbar__tab"
      :class="{ 'emp-tabbar__tab--active': isActive(tab) }"
    >
      <svg class="emp-tabbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
      </svg>
      <span class="emp-tabbar__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.emp-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: 64px;
  background: var(--emp-card);
  border-top: 1px solid var(--emp-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -1px 0 var(--emp-border), 0 -4px 16px rgba(0,0,0,0.04);
}

.emp-tabbar__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: var(--emp-text-muted);
  transition: color 150ms, background 150ms;
  position: relative;
  min-width: 3rem;
}

.emp-tabbar__tab:hover {
  background: var(--emp-accent-muted);
  color: var(--emp-text-secondary);
}

.emp-tabbar__tab--active {
  color: var(--emp-accent);
}

.emp-tabbar__tab--active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 2px;
  background: var(--emp-accent);
  border-radius: 0 0 2px 2px;
}

.emp-tabbar__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.emp-tabbar__label {
  font-family: var(--emp-font-body);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/employee/EmployeeTabBar.vue
git commit -m "feat(employee-tabbar): create EmployeeTabBar with 5 icon+label tabs"
```

---

## Task 3: EmployeeCard, EmployeeBadge, EmployeeSkeleton

**Files:**
- Create: `frontend/src/components/employee/EmployeeCard.vue`
- Create: `frontend/src/components/employee/EmployeeBadge.vue`
- Create: `frontend/src/components/employee/EmployeeSkeleton.vue`

- [ ] **Step 1: Write EmployeeCard.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
}>(), {
  padding: 'md',
  hoverable: false,
})
</script>

<template>
  <div
    :class="['emp-card', `emp-card--pad-${padding}`, { 'emp-card--hoverable': hoverable }]"
  >
    <slot />
  </div>
</template>

<style scoped>
.emp-card {
  background: var(--emp-card);
  border: 1px solid var(--emp-border);
  border-radius: var(--emp-radius);
  box-shadow: var(--emp-shadow);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.emp-card--pad-sm { padding: 1rem; }
.emp-card--pad-md { padding: 1.25rem; }
.emp-card--pad-lg { padding: 1.5rem; }

.emp-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--emp-shadow-lg);
  border-color: var(--emp-accent);
}
</style>
```

- [ ] **Step 2: Write EmployeeBadge.vue**

```vue
<script setup lang="ts">
type Status = 'present' | 'late' | 'absent' | 'half_day'

withDefaults(defineProps<{
  status: Status
  label?: string
}>(), {
  label: '',
})

const map: Record<Status, { color: string; bg: string }> = {
  present:  { color: 'var(--emp-success)', bg: 'rgba(16, 185, 129, 0.08)' },
  late:     { color: 'var(--emp-warning)', bg: 'rgba(245, 158, 11, 0.08)' },
  absent:   { color: 'var(--emp-danger)', bg: 'rgba(239, 68, 68, 0.08)' },
  half_day: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
}

const labels: Record<Status, string> = {
  present: 'Present', late: 'Late', absent: 'Absent', half_day: 'Half Day',
}
</script>

<template>
  <span
    class="emp-badge"
    :style="{ color: map[status].color, background: map[status].bg }"
  >
    {{ label || labels[status] }}
  </span>
</template>

<style scoped>
.emp-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-family: var(--emp-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid currentColor;
  opacity: 0.9;
}
</style>
```

- [ ] **Step 3: Write EmployeeSkeleton.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'card' | 'list' | 'row'
  count?: number
}>(), {
  type: 'card',
  count: 1,
})
</script>

<template>
  <div class="emp-skeleton">
    <!-- Card skeleton -->
    <template v-if="type === 'card'">
      <div v-for="i in count" :key="i" class="emp-skeleton__card">
        <div class="emp-skeleton__line emp-skeleton__line--title" />
        <div class="emp-skeleton__line" />
        <div class="emp-skeleton__line emp-skeleton__line--short" />
      </div>
    </template>

    <!-- List skeleton -->
    <template v-else-if="type === 'list'">
      <div v-for="i in count" :key="i" class="emp-skeleton__list-item">
        <div class="emp-skeleton__circle" />
        <div class="emp-skeleton__lines">
          <div class="emp-skeleton__line" />
          <div class="emp-skeleton__line emp-skeleton__line--short" />
        </div>
        <div class="emp-skeleton__badge" />
      </div>
    </template>

    <!-- Row skeleton -->
    <template v-else>
      <div v-for="i in count" :key="i" class="emp-skeleton__row">
        <div class="emp-skeleton__line" />
        <div class="emp-skeleton__line emp-skeleton__line--short" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.emp-skeleton { display: flex; flex-direction: column; gap: 0.75rem; }

.emp-skeleton__card {
  background: var(--emp-card);
  border: 1px solid var(--emp-border);
  border-radius: var(--emp-radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.emp-skeleton__list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--emp-border);
}

.emp-skeleton__row {
  background: var(--emp-card);
  border: 1px solid var(--emp-border);
  border-radius: var(--emp-radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emp-skeleton__circle {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--emp-border);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.emp-skeleton__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.emp-skeleton__line {
  height: 0.75rem;
  border-radius: 0.25rem;
  background: var(--emp-border);
  animation: pulse 1.5s ease-in-out infinite;
}

.emp-skeleton__line--title { height: 1rem; width: 60%; }
.emp-skeleton__line--short { width: 40%; }

.emp-skeleton__badge {
  width: 3rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: var(--emp-border);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/employee/EmployeeCard.vue frontend/src/components/employee/EmployeeBadge.vue frontend/src/components/employee/EmployeeSkeleton.vue
git commit -m "feat(employee-components): add EmployeeCard, EmployeeBadge, EmployeeSkeleton"
```

---

## Task 4: Router — Add Employee Route Group

**Files:**
- Modify: `frontend/src/router/index.ts:1-77`

- [ ] **Step 1: Add employee route group**

Insert this route group into the `routes` array in `frontend/src/router/index.ts`, after the admin routes:

```ts
// Employee routes
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

Also update the `beforeEach` guard to add employee route protection:

```ts
// Protect employee routes — redirect to employee login if not authenticated
if (to.path.startsWith('/employee') && to.meta.role === 'employee' && !token) {
  return { name: 'employee-login' }
}

// Redirect logged-in employees away from employee login
if (to.name === 'employee-login' && token && userRole === 'employee') {
  return { name: 'employee-dashboard' }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/router/index.ts
git commit -m "feat(router): add /employee route group with EmployeeLayout wrapper"
```

---

## Task 5: Admin Page CSS Variable Migration (5 pages)

**Files:**
- Modify: `frontend/src/pages/admin/EmployeesPage.vue` (replace all Tailwind color/shadow classes)
- Modify: `frontend/src/pages/admin/AttendancePage.vue`
- Modify: `frontend/src/pages/admin/PayrollPage.vue`
- Modify: `frontend/src/pages/admin/ReportsPage.vue`
- Modify: `frontend/src/pages/admin/SettingsPage.vue`

For each page, apply this migration pattern:

**Add scoped CSS tokens** at the top of `<style scoped>`:
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
  --admin-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 16px 32px -4px rgba(0, 0, 0, 0.4);
  --admin-radius: 1rem;
}
```

**Replace Tailwind class mappings:**

| Tailwind class | Replace with |
|---|---|
| `text-gray-900` | `color: var(--admin-text)` |
| `text-gray-500` | `color: var(--admin-text-secondary)` |
| `text-gray-400` | `color: var(--admin-text-muted)` |
| `bg-white` | `background: var(--admin-card)` |
| `bg-gray-50` | `background: var(--admin-bg)` |
| `bg-gray-100` | `background: var(--admin-bg)` |
| `bg-indigo-600` | `background: var(--admin-accent)` |
| `bg-indigo-700` | `background: var(--admin-accent)` |
| `bg-indigo-100` | `background: var(--admin-accent-muted)` |
| `bg-red-50` | `background: var(--admin-danger-muted)` |
| `border-gray-100` | `border: 1px solid var(--admin-border)` |
| `border-gray-200` | `border: 1px solid var(--admin-border)` |
| `text-red-600` | `color: var(--admin-danger)` |
| `text-purple-700` | `color: #a78bfa` |
| `text-blue-700` | `color: var(--admin-accent)` |
| `text-indigo-600` | `color: var(--admin-accent)` |
| `text-indigo-700` | `color: var(--admin-accent)` |
| `shadow-lg` | `box-shadow: var(--admin-shadow)` |
| `rounded-2xl` | `border-radius: var(--admin-radius)` |
| `rounded-xl` | `border-radius: 0.75rem` |
| `rounded-lg` | `border-radius: 0.625rem` |
| `animate-pulse` | `animation: pulse 1.5s ease-in-out infinite` |

- [ ] **Step 1: Migrate EmployeesPage.vue**

Take the content from the template and replace `class="..."` attributes with `style` attributes using the CSS token variables. Add `animation: pulse` keyframe definition.

- [ ] **Step 2: Migrate AttendancePage.vue**

Same pattern. Replace all Tailwind utility classes for color/border/shadow with CSS variable equivalents.

- [ ] **Step 3: Migrate PayrollPage.vue**

Same pattern.

- [ ] **Step 4: Migrate ReportsPage.vue**

Read the file first, then apply the migration.

- [ ] **Step 5: Migrate SettingsPage.vue**

Read the file first, then apply the migration.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/EmployeesPage.vue frontend/src/pages/admin/AttendancePage.vue frontend/src/pages/admin/PayrollPage.vue frontend/src/pages/admin/ReportsPage.vue frontend/src/pages/admin/SettingsPage.vue
git commit -m "refactor(admin-pages): migrate from Tailwind utility classes to CSS design tokens"
```

---

## Task 6: Admin Component Enhancements

**Files:**
- Modify: `frontend/src/components/admin/AdminTable.vue`
- Modify: `frontend/src/components/admin/AdminEmptyState.vue`

- [ ] **Step 1: Enhance AdminTable.vue**

Add responsive overflow: ensure the wrapper already has `overflow-x: auto`. Confirm hover state on `tr` rows is present. If missing, add:

```css
.admin-table__body :deep(tr:hover) {
  background: var(--bg-secondary);
}
```

- [ ] **Step 2: Enhance AdminEmptyState.vue**

Add a CTA slot (already partially done). Ensure the component accepts an `action` slot and renders it with proper spacing:

```vue
<!-- In template, after description -->
<div v-if="$slots.default" class="admin-empty__cta">
  <slot />
</div>
```

Add to styles:
```css
.admin-empty__cta {
  margin-top: 0.75rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/admin/AdminTable.vue frontend/src/components/admin/AdminEmptyState.vue
git commit -m "feat(admin-components): enhance AdminTable hover/overflow and AdminEmptyState CTA slot"
```

---

## Verification Checklist

After all tasks, run through this checklist:

- [ ] Open `/employee` in browser — EmployeeLayout renders with top bar and bottom tab bar
- [ ] Top bar shows employee initials avatar + name from auth store
- [ ] Clicking each tab navigates to the correct route (Clock, Dashboard, History, Profile, Settings)
- [ ] Active tab shows indigo underline and active icon color
- [ ] EmployeeCard renders with white card, border, rounded corners, shadow
- [ ] EmployeeBadge renders status-colored badges for present/late/absent/half_day
- [ ] EmployeeSkeleton shows shimmer animation
- [ ] Open `/admin/employees` — page uses CSS variables (no Tailwind color classes in computed style)
- [ ] Admin table rows have hover state
- [ ] AdminEmptyState shows optional CTA button when slot is provided
- [ ] No TypeScript errors in `vue-tsc` (or minimal, pre-existing ones only)
