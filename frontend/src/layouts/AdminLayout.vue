<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const route = useRoute()

const pageTitle = computed(() => {
  const name = route.name?.toString() || 'Dashboard'
  return name.replace('admin-', '').replace(/-/g, ' ')
})
</script>

<template>
  <div class="admin-shell">
    <!-- Fixed Sidebar (desktop only) -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <div class="admin-main">
      <!-- Top Header -->
      <header class="admin-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="header-right">
          <slot name="header-actions" />
        </div>
      </header>

      <!-- Page Content -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ─── Shell ────────────────────────────────────────────────── */
.admin-shell {
  min-height: 100vh;
  background: var(--background);
  display: flex;
}

/* ─── Main Area ───────────────────────────────────────────── */
.admin-main {
  flex: 1;
  margin-left: 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ─── Header ──────────────────────────────────────────────── */
.admin-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 64px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  gap: 1rem;
}

.page-title {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

/* ─── Content ─────────────────────────────────────────────── */
.admin-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
}

@media (max-width: 1024px) {
  .admin-main {
    margin-left: 64px;
  }

  .admin-content {
    padding: 1.5rem;
  }
}

/* ─── Dark mode ───────────────────────────────────────────── */
:global(.dark) .admin-shell {
  background: var(--background);
}

:global(.dark) .admin-header {
  background: var(--card);
  border-color: var(--border);
}

:global(.dark) .page-title {
  color: var(--foreground);
}
</style>