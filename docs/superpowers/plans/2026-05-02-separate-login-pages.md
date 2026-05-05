# Separate Login Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the unified login page into two separate pages — employee (`/login`) and admin (`/admin/login`) — each with corporate minimal slate + accent styling.

**Architecture:** Frontend-only change. Router updated with two distinct login routes. Two new page components created. Auth store and backend unchanged. Role-based redirects updated.

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, IBM Plex Sans (Google Fonts CDN)

---

## File Map

```
frontend/
├── index.html                                           ← add IBM Plex Sans font link
├── src/
│   ├── pages/
│   │   ├── LoginPage.vue                               ← DELETE (old unified page)
│   │   ├── employee/
│   │   │   └── EmployeeLoginPage.vue                  ← CREATE (amber accent)
│   │   └── admin/
│   │       └── AdminLoginPage.vue                     ← CREATE (emerald accent)
│   └── router/
│       └── index.ts                                    ← UPDATE routes
```

**No backend changes.** Auth endpoints handle both roles.

---

## Tasks

### Task 1: Add IBM Plex Sans to index.html

**Files:**
- Modify: `frontend/index.html:1-13`

- [ ] **Step 1: Add IBM Plex Sans font link**

Replace lines 1–13 of `frontend/index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>Attendance App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/index.html
git commit -m "feat(login): add IBM Plex Sans font"
```

---

### Task 2: Update Router

**Files:**
- Modify: `frontend/src/router/index.ts`

- [ ] **Step 1: Replace router config**

Replace the full contents of `frontend/src/router/index.ts` with:

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/login',
      name: 'employee-login',
      component: () => import('@/pages/employee/EmployeeLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/pages/admin/AdminLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { requiresAuth: false },
    },
    // Employee routes
    {
      path: '/',
      component: () => import('@/layouts/EmployeeLayout.vue'),
      meta: { requiresAuth: true, role: 'employee' },
      children: [
        {
          path: '',
          name: 'employee-dashboard',
          component: () => import('@/pages/employee/DashboardPage.vue'),
        },
        {
          path: 'clock',
          name: 'clock',
          component: () => import('@/pages/employee/ClockPage.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/pages/employee/HistoryPage.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/employee/ProfilePage.vue'),
        },
      ],
    },
    // Admin routes
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/pages/admin/DashboardPage.vue'),
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/pages/admin/EmployeesPage.vue'),
        },
        {
          path: 'attendance',
          name: 'admin-attendance',
          component: () => import('@/pages/admin/AttendancePage.vue'),
        },
        {
          path: 'payroll',
          name: 'payroll',
          component: () => import('@/pages/admin/PayrollPage.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/pages/admin/ReportsPage.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/pages/admin/SettingsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('auth_token')
  const userRole = localStorage.getItem('user_role')

  // Protect admin routes — redirect to admin login if not authenticated
  if (to.path.startsWith('/admin') && to.meta.role === 'admin' && !token) {
    return { name: 'admin-login' }
  }

  // Protect employee routes — redirect to employee login if not authenticated
  if ((to.path === '/' || !to.path.startsWith('/admin')) && to.meta.requiresAuth && !token) {
    return { name: 'employee-login' }
  }

  // Role guard — redirect if user goes to wrong portal
  if (to.meta.role && userRole !== to.meta.role) {
    return { name: userRole === 'admin' ? 'admin-dashboard' : 'employee-dashboard' }
  }

  // Redirect logged-in users away from login pages
  if (to.name === 'employee-login' && token && userRole !== 'admin') {
    return { name: 'employee-dashboard' }
  }
  if (to.name === 'admin-login' && token && userRole === 'admin') {
    return { name: 'admin-dashboard' }
  }

  return true
})

export default router
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/router/index.ts
git commit -m "feat(router): separate login routes for employee and admin"
```

---

### Task 3: Create EmployeeLoginPage.vue

**Files:**
- Create: `frontend/src/pages/employee/EmployeeLoginPage.vue`

- [ ] **Step 1: Write EmployeeLoginPage.vue**

Create `frontend/src/pages/employee/EmployeeLoginPage.vue` with this full content:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Please enter a valid email'
})

const isFormValid = computed(() => {
  return email.value.length > 0 &&
    password.value.length > 0 &&
    !emailError.value
})

async function handleLogin() {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    email: email.value,
    password: password.value,
  })

  isLoading.value = false

  if (result.success) {
    localStorage.setItem('user_role', authStore.user?.role || 'employee')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/')
  } else {
    errorMessage.value = result.message || 'Login failed. Please check your credentials.'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Icon + Header -->
      <div class="card-header">
        <div class="icon-wrap">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="9" stroke-width="1.5"/>
            <path stroke-linecap="round" stroke-width="1.5" d="M12 7v5l3 3"/>
          </svg>
        </div>
        <h1 class="title">Attendance App</h1>
        <p class="subtitle">Sign in to your account</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="form">
        <div class="field">
          <label for="email" class="label">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="input"
            :class="{ 'input--error': emailError }"
          />
          <p v-if="emailError" class="field-error">{{ emailError }}</p>
        </div>

        <div class="field">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            class="input"
          />
        </div>

        <button
          type="submit"
          :disabled="!isFormValid || isLoading"
          class="btn"
          :class="{ 'btn--loading': isLoading }"
        >
          <span v-if="isLoading" class="btn-spinner">
            <svg class="spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider"/>

      <!-- Register Link -->
      <p class="register-link">
        Don't have an account?
        <a href="#" @click.prevent="router.push('/register')" class="link">Sign up</a>
      </p>
    </div>

    <!-- Footer -->
    <p class="footer">© 2026 Attendance App. All rights reserved.</p>
  </div>
</template>

<style scoped>
/* === Shared Variables === */
:root {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --card-border: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --input-bg: #0f172a;
  --input-border: #334155;
  --accent: #f59e0b;
  --accent-glow: rgba(245, 158, 11, 0.15);
  --accent-hover: #d97706;
  --error-bg: rgba(239, 68, 68, 0.08);
  --error-border: rgba(239, 68, 68, 0.3);
  --error-text: #fca5a5;
}

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  background-image:
    radial-gradient(circle at 50% 0%, var(--accent-glow) 0%, transparent 50%),
    radial-gradient(ellipse at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
  background-size: 100% 100%, 24px 24px;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  padding: 1rem;
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  padding: 2.5rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: var(--accent-glow);
  margin-bottom: 1rem;
  box-shadow: 0 0 2rem var(--accent-glow);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.375rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.75rem;
  color: var(--error-text);
  font-size: 0.8125rem;
  margin-bottom: 1.5rem;
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 0.625rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: border-color 200ms, box-shadow 200ms;
  box-sizing: border-box;
}

.input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input--error {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.04);
}

.field-error {
  font-size: 0.75rem;
  color: #fca5a5;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--accent);
  color: #0f172a;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 0.625rem;
  border: none;
  cursor: pointer;
  transition: background 200ms, transform 100ms;
  box-shadow: 0 4px 1.5rem rgba(245, 158, 11, 0.2);
}

.btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spin {
  width: 1rem;
  height: 1rem;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.divider {
  height: 1px;
  background: var(--card-border);
  margin: 1.5rem 0;
}

.register-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.link {
  color: var(--accent);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms;
}

.link:hover {
  color: var(--accent-hover);
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #475569;
  text-align: center;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/employee/EmployeeLoginPage.vue
git commit -m "feat(employee-login): create EmployeeLoginPage with amber slate aesthetic"
```

---

### Task 4: Create AdminLoginPage.vue

**Files:**
- Create: `frontend/src/pages/admin/AdminLoginPage.vue`

- [ ] **Step 1: Write AdminLoginPage.vue**

Create `frontend/src/pages/admin/AdminLoginPage.vue` with this full content:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Please enter a valid email'
})

const isFormValid = computed(() => {
  return email.value.length > 0 &&
    password.value.length > 0 &&
    !emailError.value
})

async function handleLogin() {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    email: email.value,
    password: password.value,
  })

  isLoading.value = false

  if (result.success) {
    localStorage.setItem('user_role', authStore.user?.role || 'employee')
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/')
  } else {
    errorMessage.value = result.message || 'Login failed. Please check your credentials.'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Icon + Header -->
      <div class="card-header">
        <div class="icon-wrap">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 13h4l3 4 4-8 3 4h4"/>
          </svg>
        </div>
        <h1 class="title">Admin Portal</h1>
        <p class="subtitle">Sign in to manage</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="form">
        <div class="field">
          <label for="email" class="label">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="admin@example.com"
            class="input"
            :class="{ 'input--error': emailError }"
          />
          <p v-if="emailError" class="field-error">{{ emailError }}</p>
        </div>

        <div class="field">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            class="input"
          />
        </div>

        <button
          type="submit"
          :disabled="!isFormValid || isLoading"
          class="btn"
          :class="{ 'btn--loading': isLoading }"
        >
          <span v-if="isLoading" class="btn-spinner">
            <svg class="spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider"/>

      <!-- Employee Login Link -->
      <p class="alt-link">
        Employee?
        <a href="#" @click.prevent="router.push('/login')" class="link">Use employee login</a>
      </p>
    </div>

    <!-- Footer -->
    <p class="footer">© 2026 Attendance App. All rights reserved.</p>
  </div>
</template>

<style scoped>
/* === Shared Variables (emerald accent) === */
:root {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --card-border: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --input-bg: #0f172a;
  --input-border: #334155;
  --accent: #10b981;
  --accent-glow: rgba(16, 185, 129, 0.15);
  --accent-hover: #059669;
  --error-bg: rgba(239, 68, 68, 0.08);
  --error-border: rgba(239, 68, 68, 0.3);
  --error-text: #fca5a5;
}

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  background-image:
    radial-gradient(circle at 50% 0%, var(--accent-glow) 0%, transparent 50%),
    radial-gradient(ellipse at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
  background-size: 100% 100%, 24px 24px;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  padding: 1rem;
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  padding: 2.5rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: var(--accent-glow);
  margin-bottom: 1rem;
  box-shadow: 0 0 2rem var(--accent-glow);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.375rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.75rem;
  color: var(--error-text);
  font-size: 0.8125rem;
  margin-bottom: 1.5rem;
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 0.625rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: border-color 200ms, box-shadow 200ms;
  box-sizing: border-box;
}

.input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input--error {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.04);
}

.field-error {
  font-size: 0.75rem;
  color: #fca5a5;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--accent);
  color: #0f172a;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 0.625rem;
  border: none;
  cursor: pointer;
  transition: background 200ms, transform 100ms;
  box-shadow: 0 4px 1.5rem rgba(16, 185, 129, 0.2);
}

.btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spin {
  width: 1rem;
  height: 1rem;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.divider {
  height: 1px;
  background: var(--card-border);
  margin: 1.5rem 0;
}

.alt-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.link {
  color: var(--accent);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms;
}

.link:hover {
  color: var(--accent-hover);
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #475569;
  text-align: center;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/admin/AdminLoginPage.vue
git commit -m "feat(admin-login): create AdminLoginPage with emerald slate aesthetic"
```

---

### Task 5: Delete old LoginPage.vue

**Files:**
- Delete: `frontend/src/pages/LoginPage.vue`

- [ ] **Step 1: Delete LoginPage.vue**

```bash
git rm frontend/src/pages/LoginPage.vue
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor(login): remove unified LoginPage — split into employee and admin pages"
```

---

## Post-Implementation Verification

1. Start backend: `cd backend && php artisan serve --port=8080`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:5173/login` — employee page (amber) should load
4. Visit `http://localhost:5173/admin/login` — admin page (emerald) should load
5. Login as `admin@example.com` / `password123` at `/admin/login` — should redirect to `/admin`
6. Login as `john.smith@example.com` / `password123` at `/login` — should redirect to `/`
7. Check browser DevTools → Network: no CORS errors
8. Check DevTools → Console: no Vue errors
