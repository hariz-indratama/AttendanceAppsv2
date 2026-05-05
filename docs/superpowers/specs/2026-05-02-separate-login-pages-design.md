# Separate Login Pages for Employee & Admin — Design Spec

**Date:** 2026-05-02
**Status:** Approved

---

## Overview

Split the current unified login page into two distinct login pages — one for employees, one for admins — each on their own URL with a differentiated visual identity using the corporate minimal aesthetic.

---

## Architecture

| Route | Component | Accent |
|---|---|---|
| `/login` | `EmployeeLoginPage.vue` | Amber (#f59e0b) |
| `/admin/login` | `AdminLoginPage.vue` | Emerald (#10b981) |

- Existing `LoginPage.vue` refactored into `EmployeeLoginPage.vue`
- New `AdminLoginPage.vue` created with matching structure
- Router updated with new routes
- Existing auth endpoints (`POST /auth/login`) handle both roles — **no backend changes needed**
- Auth store and guard logic unchanged

---

## Visual Design

### Shared Structure
- Full-page centered layout, dark slate background (#0f172a)
- IBM Plex Sans typography (Google Fonts CDN)
- Centered card: `max-w-md`, slate-800, subtle border
- Entrance animation: `opacity: 0 → 1`, `scale: 0.97 → 1`, `duration: 400ms`
- Background: subtle geometric dot grid pattern (CSS-generated)
- Form: email + password fields, single submit button
- Error alert: red tinted box, icon + message
- Footer copyright text

### Per-Role Differentiation

**Employee (`/login`)**
- Accent color: Amber `#f59e0b`
- Glow: warm amber radial gradient behind icon
- Icon: Clock (clock-face SVG) — signals time tracking
- Headline: "Attendance App"
- Subline: "Sign in to your account"
- Body copy: "Clock in to work"

**Admin (`/admin/login`)**
- Accent color: Emerald `#10b981`
- Glow: structured emerald radial gradient
- Icon: Shield + bar-chart composite SVG — signals management
- Headline: "Admin Portal"
- Subline: "Sign in to manage"
- Body copy: "Access the management dashboard"

### CSS Variables

```css
/* Shared */
--bg-dark: #0f172a;
--card-bg: #1e293b;
--card-border: #334155;
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--input-bg: #0f172a;
--input-border: #334155;

/* Employee (amber) */
--accent: #f59e0b;
--accent-glow: rgba(245, 158, 11, 0.15);

/* Admin (emerald) */
--accent: #10b981;
--accent-glow: rgba(16, 185, 129, 0.15);
```

### Typography
- Display/Heading: IBM Plex Sans, 700 weight
- Body/Labels: IBM Plex Sans, 400/500 weight
- No decorative display fonts — IBM Plex Sans is the distinctive choice here

---

## Component Inventory

### EmployeeLoginPage.vue (new file from refactor)
- States: idle, loading, error
- Amber accent theme
- Clock icon motif
- Redirect to `/` on success

### AdminLoginPage.vue (new file)
- States: idle, loading, error
- Emerald accent theme
- Shield + chart icon motif
- Redirect to `/admin` on success

### Input Fields (shared pattern)
- Default: slate border, dark bg
- Focus: accent-colored ring, accent border
- Error: red border, red bg tint
- Placeholder text in muted slate

### Submit Button
- Default (valid): accent bg, white text, subtle shadow
- Disabled: gray bg, no pointer
- Loading: spinner + "Signing in..." text
- Hover: slightly lighter accent bg
- Active: slight scale-down (0.98)

### Error Alert
- Red-50 bg, red-200 border
- Inline SVG alert icon
- Dismissible (no close button needed — clears on next submit)

---

## Router Changes

```typescript
// Before
{
  path: '/login',
  name: 'login',
  component: () => import('@/pages/LoginPage.vue'),
  meta: { requiresAuth: false },
},

// After
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
```

- Guard: if already logged in as admin, redirect from `/login` → `/admin`
- Guard: if already logged in as employee, redirect from `/admin/login` → `/`
- Guard: if not logged in, accessing `/admin` → redirect to `/admin/login`
- Guard: if not logged in, accessing `/` → redirect to `/login`

---

## Files

### Create
- `frontend/src/pages/employee/EmployeeLoginPage.vue`
- `frontend/src/pages/admin/AdminLoginPage.vue`

### Delete
- `frontend/src/pages/LoginPage.vue`

### Modify
- `frontend/src/router/index.ts`

### No Changes
- Backend auth controllers
- Auth store
- API endpoints
- Auth types

---

## Implementation Notes

1. Use CSS variables scoped to the page component for accent theming
2. Background dot grid: `radial-gradient` with tiny circles, low opacity
3. IBM Plex Sans: load via `<link>` in `index.html` or `@import` in CSS
4. Animations: CSS transitions only (no JS animation library needed for this scope)
5. The `LoginPage.vue` rename is a move + rename in git, not a delete + create (preserves history)
