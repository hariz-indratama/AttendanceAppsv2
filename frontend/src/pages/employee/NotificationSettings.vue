<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const { permission, options, toggle, loadFromStorage } = useNotifications()

onMounted(() => loadFromStorage())

const bannerDismissed = ref(false)

const items = [
  { key: 'clockReminder' as const, label: 'Clock Reminder', desc: 'Remind before shift starts' },
  { key: 'shiftUpdates' as const, label: 'Shift Updates', desc: 'Roster & schedule changes' },
  { key: 'payrollAlerts' as const, label: 'Payroll Alerts', desc: 'Payslip & deductions' },
  { key: 'adminMessages' as const, label: 'Admin Messages', desc: 'Direct messages from HR' },
]

const appVersion = '1.0.0'
const buildNumber = '2026.05.03'
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-eyebrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span>Settings</span>
      </div>
      <h1 class="page-title">Notifications</h1>
      <p class="page-subtitle">Choose what alerts you receive</p>
    </div>

    <!-- Permission warning banner -->
    <div v-if="permission === 'denied' && !bannerDismissed" class="warning-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Notifications blocked — allow in browser settings to receive alerts</span>
      <button class="banner-dismiss" @click="bannerDismissed = true" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="settings-list">
      <div v-for="(item, ii) in items" :key="item.key" class="settings-row" :style="{ animationDelay: `${100 + ii * 30}ms` }">
        <div class="settings-info">
          <p class="settings-label">{{ item.label }}</p>
          <p class="settings-desc">{{ item.desc }}</p>
        </div>
        <button
          class="toggle"
          :class="{ 'toggle--on': options[item.key] }"
          :aria-checked="options[item.key]"
          role="switch"
          @click="toggle(item.key)"
        >
          <span class="toggle-thumb" />
        </button>
      </div>
    </div>

    <!-- Back link -->
    <div class="back-row">
      <router-link to="/settings" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* All styles consume global CSS tokens from main.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-top: 0.5rem;
  font-family: var(--font-body);
  animation: fadeUp 400ms ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-header { display: flex; flex-direction: column; gap: 0.25rem; }

.page-header-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--accent);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.page-header-eyebrow svg { width: 0.875rem; height: 0.875rem; }
.page-title {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.page-subtitle { font-size: 0.875rem; color: var(--text-muted); }

.warning-banner {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  background: var(--warning-muted);
  border: 1px solid var(--warning-border);
  border-radius: 0.875rem;
  color: var(--warning);
  font-size: 0.8125rem;
  font-weight: 500;
  animation: fadeUp 200ms ease-out;
}
.warning-banner svg { width: 1rem; height: 1rem; flex-shrink: 0; }
.warning-banner span { flex: 1; }
.banner-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--warning);
  padding: 0.125rem;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 150ms;
}
.banner-dismiss:hover { opacity: 1; }
.banner-dismiss svg { width: 0.875rem; height: 0.875rem; }

.settings-list {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9375rem 1rem;
  border-bottom: 1px solid var(--border);
  animation: fadeUp 200ms ease-out both;
}
.settings-row:last-child { border-bottom: none; }
.settings-row:hover { background: rgba(255, 255, 255, 0.025); }
.settings-info { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; padding-right: 1rem; }
.settings-label { font-size: 0.9375rem; font-weight: 500; color: var(--text-primary); }
.settings-desc { font-size: 0.75rem; color: var(--text-muted); }

.toggle {
  width: 3rem;
  height: 1.625rem;
  border-radius: 999px;
  background: var(--border);
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.toggle--on { background: var(--accent); }
.toggle-thumb {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.toggle--on .toggle-thumb { transform: translateX(1.375rem); }

.back-row {
  display: flex;
  justify-content: center;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.625rem;
  transition: color 150ms, background 150ms;
}
.back-link:hover { color: var(--text-secondary); background: rgba(255,255,255,0.03); }
.back-link svg { width: 1rem; height: 1rem; }
</style>
