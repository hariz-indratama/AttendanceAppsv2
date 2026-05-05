<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoggingOut = ref(false)

const adminNavigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Attendance', path: '/attendance', icon: ClipboardList },
  { name: 'Payroll', path: '/payroll', icon: Wallet },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
]

function isActiveRoute(path: string): boolean {
  if (path === '/') return route.path === '/admin' || route.path === '/'
  return route.path.endsWith(path)
}

function handleNavClick(path: string) {
  router.push(path)
}

async function handleLogout() {
  isLoggingOut.value = true
  await authStore.logout()
  localStorage.removeItem('user_role')
  router.push('/admin/login')
}
</script>

<template>
  <aside class="admin-sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span class="logo-text">Admin Portal</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <Button
        v-for="item in adminNavigation"
        :key="item.path"
        variant="ghost"
        :class="[
          'nav-item w-full justify-start h-auto py-2 px-3',
          isActiveRoute(item.path) ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-500' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        ]"
        @click="handleNavClick(item.path)"
      >
        <component :is="item.icon" class="nav-icon h-4 w-4 shrink-0" />
        <span class="nav-label text-sm font-medium">{{ item.name }}</span>
      </Button>
    </nav>

    <!-- User & Logout -->
    <div class="sidebar-footer">
      <Separator class="mb-3" />
      <div class="user-info">
        <Avatar class="h-9 w-9 shrink-0">
          <AvatarFallback class="bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </AvatarFallback>
        </Avatar>
        <div class="user-details min-w-0">
          <p class="user-name text-sm font-medium truncate">{{ authStore.user?.name || 'Admin' }}</p>
          <p class="user-role text-xs text-muted-foreground">Administrator</p>
        </div>
      </div>
      <Button
        variant="ghost"
        :disabled="isLoggingOut"
        class="logout-btn w-full justify-start h-auto py-2 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="handleLogout"
      >
        <LogOut class="logout-icon h-4 w-4 shrink-0" />
        <span class="text-sm font-medium">{{ isLoggingOut ? 'Logging out…' : 'Logout' }}</span>
      </Button>
    </div>
  </aside>
</template>

<style scoped>
/* ─── Desktop & Tablet Sidebar ─────────────────────────────── */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 30;
  width: 260px;
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Logo ────────────────────────────────────────────────── */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0 1.25rem;
  height: 64px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.logo-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: rgba(16, 185, 129, 0.12);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon-svg {
  width: 1.125rem;
  height: 1.125rem;
  color: #10b981;
}

.logo-text {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
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

/* ─── Sidebar Footer ───────────────────────────────────────── */
.sidebar-footer {
  flex-shrink: 0;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.user-details {
  min-width: 0;
}

/* ─── Dark mode ───────────────────────────────────────────── */
:global(.dark) .admin-sidebar {
  background: var(--card);
  border-color: var(--border);
}

:global(.dark) .logo-icon {
  background: rgba(16, 185, 129, 0.15);
}

:global(.dark) .user-avatar {
  background: rgba(16, 185, 129, 0.15);
}
</style>