<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const route = useRoute()
const isDrawerOpen = ref(false)

const pageTitle = computed(() => {
  const name = route.name?.toString() || 'Dashboard'
  return name.replace('admin-', '').replace(/-/g, ' ')
})

function openDrawer() {
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
}
</script>

<template>
  <div class="admin-shell">
    <!-- Sidebar (desktop/tablet) + Bottom nav + Drawer (mobile) -->
    <AdminSidebar
      :isDrawerOpen="isDrawerOpen"
      @closeDrawer="closeDrawer"
    />

    <!-- Main Content Area -->
    <div class="admin-main">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="header-left">
          <!-- Hamburger — only visible on mobile -->
          <button
            @click="openDrawer"
            class="hamburger-btn"
            aria-label="Open menu"
            type="button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <slot name="header-actions" />
        </div>
      </header>

      <!-- Page Content -->
      <main class="admin-content">
        <div class="admin-content-inner">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ─── Shell ────────────────────────────────────────────────── */
.admin-shell {
  min-height: 100%;
  min-height: 100dvh;
  background: var(--bg-primary);
  display: flex;
}

/* ─── Main Area ───────────────────────────────────────────── */
.admin-main {
  flex: 1;
  margin-left: var(--admin-sidebar-width);
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--admin-sidebar-transition);
}

/* ─── Header ──────────────────────────────────────────────── */
.admin-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--admin-header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.hamburger-btn {
  display: none;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.hamburger-btn svg {
  width: 1.375rem;
  height: 1.375rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  text-transform: capitalize;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* ─── Content ─────────────────────────────────────────────── */
.admin-content {
  flex: 1;
  padding: 1.5rem;
}

.admin-content-inner {
  max-width: var(--admin-content-max);
  margin: 0 auto;
}

/* ─── Responsive: Tablet ───────────────────────────────────── */
@media (max-width: 1023px) {
  .admin-main {
    margin-left: var(--admin-sidebar-icon);
  }
}

/* ─── Responsive: Mobile ────────────────────────────────────── */
@media (max-width: 767px) {
  .admin-main {
    margin-left: 0;
  }

  .admin-header {
    padding: 0 1rem;
  }

  .hamburger-btn {
    display: flex;
  }

  .page-title {
    font-size: 1.125rem;
  }

  .admin-content {
    padding: 1rem;
    /* Space for bottom nav bar */
    padding-bottom: calc(var(--admin-bottom-nav-height) + 1rem);
  }
}

@media (max-width: 480px) {
  .admin-content {
    padding: 0.75rem;
    padding-bottom: calc(var(--admin-bottom-nav-height) + 0.75rem);
  }
}
</style>
