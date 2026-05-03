<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
  isDrawerOpen: boolean
}>()

const emit = defineEmits<{
  closeDrawer: []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoggingOut = ref(false)

const adminNavigation = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Employees',
    path: '/admin/employees',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    name: 'Attendance',
    path: '/admin/attendance',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-3-8h3m-3 4h3m-3-4h3',
  },
  {
    name: 'Payroll',
    path: '/admin/payroll',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    name: 'Reports',
    path: '/admin/reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

const bottomNavItems = computed(() => adminNavigation.slice(0, 5))

const isActiveRoute = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

function handleNavClick(path: string) {
  router.push(path)
  emit('closeDrawer')
}

async function handleLogout() {
  isLoggingOut.value = true
  await authStore.logout()
  localStorage.removeItem('user_role')
  router.push('/login')
}
</script>

<template>
  <!-- ── Desktop & Tablet Sidebar ─────────────────────────────── -->
  <aside class="admin-sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span class="logo-text">Admin</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <button
        v-for="item in adminNavigation"
        :key="item.path"
        @click="handleNavClick(item.path)"
        class="nav-item"
        :class="{ 'nav-item--active': isActiveRoute(item.path) }"
        :title="item.name"
        type="button"
      >
        <span class="nav-active-bar"></span>
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>
        <span class="nav-label">{{ item.name }}</span>
      </button>
    </nav>

    <!-- User & Logout -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <span>{{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}</span>
        </div>
        <div class="user-details">
          <p class="user-name">{{ authStore.user?.name || 'Admin' }}</p>
          <p class="user-role">Administrator</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="logout-btn"
        type="button"
      >
        <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{{ isLoggingOut ? 'Logging out…' : 'Logout' }}</span>
      </button>
    </div>
  </aside>

  <!-- ── Mobile Bottom Nav ────────────────────────────────────── -->
  <nav class="admin-bottom-nav">
    <button
      v-for="item in bottomNavItems"
      :key="item.path"
      @click="handleNavClick(item.path)"
      class="bottom-nav-item"
      :class="{ 'bottom-nav-item--active': isActiveRoute(item.path) }"
      type="button"
    >
      <svg class="bottom-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
      </svg>
      <span class="bottom-nav-label">{{ item.name }}</span>
    </button>
  </nav>

  <!-- ── Mobile Drawer Overlay ───────────────────────────────── -->
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div
        v-if="isDrawerOpen"
        class="drawer-overlay"
        @click="emit('closeDrawer')"
      ></div>
    </Transition>
    <Transition name="drawer-panel">
      <div v-if="isDrawerOpen" class="drawer-panel">
        <div class="drawer-header">
          <div class="sidebar-logo">
            <div class="logo-icon">
              <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="logo-text">Admin</span>
          </div>
          <button @click="emit('closeDrawer')" class="drawer-close" type="button" aria-label="Close menu">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="sidebar-nav">
          <button
            v-for="item in adminNavigation"
            :key="item.path"
            @click="handleNavClick(item.path)"
            class="nav-item"
            :class="{ 'nav-item--active': isActiveRoute(item.path) }"
            type="button"
          >
            <span class="nav-active-bar"></span>
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            <span class="nav-label">{{ item.name }}</span>
          </button>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <span>{{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}</span>
            </div>
            <div class="user-details">
              <p class="user-name">{{ authStore.user?.name || 'Admin' }}</p>
              <p class="user-role">Administrator</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="logout-btn"
            type="button"
          >
            <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ isLoggingOut ? 'Logging out…' : 'Logout' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ─── Desktop / Tablet Sidebar ─────────────────────────────── */
.admin-sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 30;
  width: var(--admin-sidebar-width);
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width var(--admin-sidebar-transition);
  overflow: hidden;
}

/* ─── Logo ────────────────────────────────────────────────── */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  height: var(--admin-header-height);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.logo-icon {
  width: 2.5rem; height: 2.5rem;
  background: var(--accent-admin-muted);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.logo-icon-svg {
  width: 1.25rem; height: 1.25rem;
  color: var(--accent-admin);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* ─── Navigation ──────────────────────────────────────────── */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 150ms ease, color 150ms ease;
  white-space: nowrap;
  overflow: hidden;
}

.nav-active-bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent-admin);
  border-radius: 0 2px 2px 0;
  transition: height 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-item--active .nav-active-bar {
  height: 1.5rem;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item--active {
  background: var(--accent-admin-muted);
  color: var(--accent-admin);
}

.nav-icon {
  width: 1.25rem; height: 1.25rem;
  flex-shrink: 0;
}

.nav-label {
  transition: opacity 150ms ease;
}

/* ─── Sidebar Footer ───────────────────────────────────────── */
.sidebar-footer {
  flex-shrink: 0;
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.user-avatar {
  width: 2.5rem; height: 2.5rem;
  background: var(--accent-admin-muted);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.user-avatar span {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-admin);
}

.user-details { min-width: 0; }

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-lg);
  background: transparent; border: none;
  color: var(--danger);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
  justify-content: flex-start;
}

.logout-btn:hover { background: var(--danger-muted); }
.logout-btn:disabled { opacity: 0.5; cursor: wait; }
.logout-icon { width: 1.125rem; height: 1.125rem; flex-shrink: 0; }

/* ─── Mobile Bottom Nav ───────────────────────────────────── */
.admin-bottom-nav {
  display: none;
}

/* ─── Mobile Drawer ────────────────────────────────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.drawer-panel {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
  width: min(var(--admin-sidebar-width), 85vw);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: var(--admin-header-height);
  border-bottom: 1px solid var(--border);
}

.drawer-close {
  width: 2rem; height: 2rem;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 150ms, color 150ms;
}

.drawer-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.drawer-close svg { width: 1.25rem; height: 1.25rem; }

/* ─── Transitions ─────────────────────────────────────────── */
.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 250ms ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-100%);
}

/* ─── Responsive: Tablet ───────────────────────────────────── */
@media (max-width: 1023px) {
  .admin-sidebar {
    width: var(--admin-sidebar-icon);
  }

  .logo-text,
  .nav-label,
  .user-details,
  .logout-btn span {
    opacity: 0;
    pointer-events: none;
  }

  .sidebar-logo {
    justify-content: center;
  }

  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }

  .sidebar-footer {
    align-items: center;
  }

  .user-info {
    justify-content: center;
  }

  .logout-btn {
    justify-content: center;
  }
}

/* ─── Responsive: Mobile ────────────────────────────────────── */
@media (max-width: 767px) {
  .admin-sidebar {
    display: none;
  }

  .admin-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 20;
    height: var(--admin-bottom-nav-height);
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    padding-bottom: env(safe-area-inset-bottom, 0);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    background: transparent; border: none;
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.6875rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 150ms, transform 100ms;
  }

  .bottom-nav-item:active {
    transform: scale(0.92);
  }

  .bottom-nav-item--active {
    color: var(--accent-admin);
  }

  .bottom-nav-icon {
    width: 1.375rem;
    height: 1.375rem;
  }

  .bottom-nav-label {
    line-height: 1;
  }
}
</style>
