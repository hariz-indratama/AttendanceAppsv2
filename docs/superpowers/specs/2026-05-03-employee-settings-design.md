# Employee Settings Page — Design Spec

**Date:** 2026-05-03
**Status:** Approved
**Scope:** Employee Settings Page — Notifications, Security, Display sections

---

## Overview

The employee Settings page controls four preference areas: notification permissions with browser API integration, location verification with geolocation, and display theme selection. The Device & Feedback section is removed.

---

## 1. Notifications Composable — `useNotifications.ts`

**Location:** `frontend/src/composables/useNotifications.ts`

### Permission States
| State | Description |
|-------|-------------|
| `default` | Permission not yet requested |
| `granted` | User approved browser notifications |
| `denied` | User blocked notifications — must be reset in browser settings |
| `unsupported` | Browser doesn't support Notification API |

### Composable API

```ts
interface NotificationOptions {
  clockReminder: boolean
  shiftUpdates: boolean
  payrollAlerts: boolean
  adminMessages: boolean
}

interface UseNotificationsReturn {
  permission: Ref<NotificationPermission | 'unsupported'>
  isSupported: boolean
  options: NotificationOptions

  requestPermission(): Promise<'granted' | 'denied' | 'unsupported'>
  isPermissionGranted(): boolean
  toggle(option: keyof NotificationOptions): Promise<void>
  scheduleClockReminder(shiftTime: string): void
  cancelClockReminder(): void
  loadFromStorage(): void
  saveToStorage(): void
}
```

### Notification Trigger Types

| Type | Trigger | Mechanism |
|------|---------|-----------|
| Clock Reminder | Automatic | Daily `setTimeout` checks shift time → fires browser notification 50 min before |
| Shift Updates | Backend | Service worker push listener (Laravel Reverb, future) |
| Payroll Alerts | Backend | Service worker push listener |
| Admin Messages | Backend | Service worker push listener |

### Behavior Per Toggle

1. User toggles a notification option
2. If `permission === 'denied'` → show inline warning banner under the toggle
3. If `permission === 'granted'` → update `options[key]`, save to `localStorage`, trigger action
4. If `permission === 'default'` → call `requestPermission()` first

### Clock Reminder Logic

- On `scheduleClockReminder(shiftTime)` → calculate ms until 50 minutes before `shiftTime`
- Use `setTimeout` to fire a `new Notification('⏰ Clock in soon!', { body: 'Your shift starts in 10 minutes', icon: '/favicon.ico' })`
- Reschedule daily at midnight (reset the timer each day)

### Storage Schema

```ts
// localStorage key: 'notification_prefs'
interface StoredNotificationPrefs {
  clockReminder: boolean
  shiftUpdates: boolean
  payrollAlerts: boolean
  adminMessages: boolean
  shiftTime: string // e.g. "08:00" — stored from user profile API
}
```

---

## 2. Security — Location Verification

**Location:** `frontend/src/composables/useGeolocation.ts` (new)

### Composable API

```ts
interface UseGeolocationReturn {
  isSupported: boolean
  status: Ref<'idle' | 'checking' | 'granted' | 'denied' | 'unavailable'>
  enabled: Ref<boolean>

  check(): Promise<boolean>
  enable(): Promise<void>
  disable(): void
  loadFromStorage(): void
}
```

### Behavior

| Event | Action |
|-------|--------|
| Toggle ON | Call `check()` → `getCurrentPosition()` with 60s timeout |
| Success | Set `enabled = true`, save to `localStorage` |
| PERMISSION_DENIED | Show inline warning, toggle stays `off` |
| POSITION_UNAVAILABLE | Show "Location unavailable" warning |
| unsupported | Show "Not supported" message |

### Storage Schema

```ts
// localStorage key: 'geolocation_enabled'
boolean
```

---

## 3. Display — Theme Selector

**Location:** `frontend/src/composables/useTheme.ts` (new)

### Composable API

```ts
type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Ref<Theme>
  resolvedTheme: Ref<'light' | 'dark'>

  setTheme(t: Theme): void
  init(): void
}
```

### Behavior

| Selection | Action |
|-----------|--------|
| `dark` | `document.documentElement.classList.add('dark')`, remove `light` class |
| `light` | Remove `dark` class, ensure no conflicting class |
| `system` | Use `window.matchMedia('(prefers-color-scheme: dark)')` listener |

### Storage Schema

```ts
// localStorage key: 'app_theme'
Theme
```

### Implementation

- On app mount (`main.ts`), call `useTheme().init()` before rendering
- CSS: `html` transition `transition: background-color 200ms, color 200ms`
- Tailwind dark mode: class-based strategy (`classDarkMode: 'dark'` in `tailwind.config.js`)

---

## 4. SettingsPage.vue — Updated UI

### Section Structure

```
SettingsPage
├── Page Header (eyebrow + title + subtitle)
├── Section Tabs: Notifications | Security | Display
├── ── Notifications Panel
│   ├── Section title row
│   ├── Settings list:
│   │   ├── Clock Reminder toggle + shift time badge
│   │   ├── Shift Updates toggle
│   │   ├── Payroll Alerts toggle
│   │   └── Admin Messages toggle
│   └── Permission warning banner (shown when denied)
├── ── Security Panel
│   ├── Biometric Auth toggle (WebAuthn via useWebAuthn)
│   └── Location Verification toggle + live status
└── ── Display Panel
    └── Theme selector: Light | Dark | System
```

### UI Details

**Section Tabs:** 3 tabs (Notifications, Security, Display), 4-column grid with active amber accent — removed "Device & Feedback"

**Notifications Panel:**
- Toggle list with descriptions
- Permission banner: amber warning with lock icon, text "Notifications blocked — allow in browser settings", dismissible
- Each toggle shows current permission status subtly

**Security Panel:**
- Biometric toggle with enrolled status badge
- Location toggle with live status dot (green=verified, amber=checking, red=denied)

**Display Panel:**
- 3-pill button selector: Light / Dark / System
- Active pill: amber background + border
- Smooth CSS transition on theme change

---

## 5. Files to Create/Modify

| Action | File |
|--------|------|
| Create | `frontend/src/composables/useNotifications.ts` |
| Create | `frontend/src/composables/useGeolocation.ts` |
| Create | `frontend/src/composables/useTheme.ts` |
| Modify | `frontend/src/pages/employee/SettingsPage.vue` |
| Modify | `frontend/src/main.ts` — init theme on mount |
| Modify | `frontend/tailwind.config.js` — dark mode class strategy |

---

## 6. Error Handling

- All composables handle unsupported browsers gracefully with user-visible messages
- `try/catch` on all async operations
- Permission denied → inline warning banner, no hard failures
- Geolocation errors → descriptive user-facing messages