<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import EmployeeTabBar from '@/components/employee/EmployeeTabBar.vue'

const authStore = useAuthStore()

const initials = computed(() => {
  const name = authStore.user?.name ?? ''
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})
</script>

<template>
  <div class="emp-shell">
    <!-- ── Fixed 56px Top Header ─────────────────────────── -->
    <header class="emp-topbar">
      <div class="topbar-left">
        <div class="avatar-circle" aria-label="User avatar">
          {{ initials }}
        </div>
        <span class="emp-name">{{ authStore.user?.name ?? 'Employee' }}</span>
      </div>
      <div class="topbar-right">
        <button class="notif-btn" aria-label="Notifications">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="notif-dot" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- ── Scrollable Content Area ─────────────────────── -->
    <main class="emp-content">
      <router-view />
    </main>

    <!-- ── Fixed 64px Bottom Tab Bar ─────────────────────── -->
    <EmployeeTabBar />
  </div>
</template>

<style scoped>
/* ─── Shell — uses global design tokens from base.css ──── */
.emp-shell {
  min-height: 100dvh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

/* ─── Top Header Bar ─────────────────────────────────────── */
.emp-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 56px;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  gap: 0.75rem;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-inverse);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.emp-name {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.notif-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.notif-btn:hover {
  background: var(--accent-muted);
  color: var(--accent);
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--danger);
  border: 1.5px solid var(--bg-card);
}

/* ─── Scrollable Content ─────────────────────────────────── */
.emp-content {
  flex: 1;
  padding-top: calc(56px + 0.5rem);
  /* bottom padding clears tab bar + safe area */
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>