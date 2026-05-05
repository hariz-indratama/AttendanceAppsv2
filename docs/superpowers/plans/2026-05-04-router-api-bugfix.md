# Router & API Bug Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three bugs: duplicate `/api/api` prefix, missing 404 catch-all route, and missing Vite proxy config causing 404 on API calls.

**Architecture:** Three targeted fixes — (1) remove `/api` from axios baseURL so calls use full path, (2) add catch-all `/:pathMatch(.*)` route to both router files, (3) add Vite proxy to both vite configs that forwards `/api` requests to Laravel on port 8080.

**Tech Stack:** Vue 3, Vite, Vue Router 5, Axios

---

### Task 1: Fix Axios baseURL — remove duplicate `/api`

**Files:**
- Modify: `frontend/src/api/axios.ts:4-5`

- [ ] **Step 1: Remove `/api` from axios baseURL**

The current `baseURL: 'http://localhost:8080/api'` causes double `/api` when API calls already include it. Change to just the host:

```ts
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  // ...rest unchanged
```

- [ ] **Step 2: Fix refresh token URL too**

```ts
const response = await axios.post(
  `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
  { refresh_token: refreshToken }
)
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/axios.ts
git commit -m "fix(api): remove duplicate /api prefix from axios baseURL"
```

---

### Task 2: Add catch-all 404 route to both router files

**Files:**
- Modify: `frontend/src/router/admin.ts`
- Modify: `frontend/src/router/employee.ts`

- [ ] **Step 1: Add NotFoundPage placeholder component to admin router**

Add this import at the top of `admin.ts`:
```ts
const NotFoundPage = { template: '<div class="p-6 text-gray-500">404 — Page not found</div>' }
```

Add catch-all route at the end of the admin `routes` array (before the closing `]`):
```ts
{
  path: '/:pathMatch(.*)*',
  name: 'admin-not-found',
  component: NotFoundPage,
  meta: { requiresAuth: false },
},
```

- [ ] **Step 2: Add catch-all route to employee router**

Same pattern for `employee.ts`:
```ts
const NotFoundPage = { template: '<div class="p-6 text-gray-500">404 — Page not found</div>' }
```

Route:
```ts
{
  path: '/:pathMatch(.*)*',
  name: 'employee-not-found',
  component: NotFoundPage,
  meta: { requiresAuth: false },
},
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/router/admin.ts frontend/src/router/employee.ts
git commit -m "fix(router): add catch-all 404 route to both admin and employee"
```

---

### Task 3: Add Vite proxy config to both vite configs

**Files:**
- Modify: `frontend/vite.config.admin.ts`
- Modify: `frontend/vite.config.employee.ts`

- [ ] **Step 1: Add proxy to admin vite config**

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

- [ ] **Step 2: Add proxy to employee vite config**

```ts
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

- [ ] **Step 3: Commit**

```bash
git add frontend/vite.config.admin.ts frontend/vite.config.employee.ts
git commit -m "fix(vite): add proxy config to forward /api requests to Laravel"
```

---

### Verification

After all tasks, run both servers and test:

```bash
npm run dev:all
# Admin:  http://localhost:5173/admin/
# Employee: http://localhost:5174/employee/
```

1. Visit `/admin/` — should redirect to `/admin-login`, no "No match found" warning
2. Visit `/employee/` — should redirect to `/login`, no "No match found" warning
3. Trigger an API call (e.g. login) — should reach `http://localhost:8080/api/...` (not `/api/api/...`)