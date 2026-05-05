<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()

const themes = [
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'system' as const, label: 'System' },
]
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-eyebrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span>Settings</span>
      </div>
      <h1 class="page-title">Display</h1>
      <p class="page-subtitle">Customize the look of the app</p>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <div>
          <p class="card-header-title">Theme</p>
          <p class="card-header-sub">Choose your preferred appearance</p>
        </div>
      </div>

      <div class="theme-selector">
        <button
          v-for="t in themes"
          :key="t.value"
          class="theme-pill"
          :class="{ 'theme-pill--active': theme === t.value }"
          @click="setTheme(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

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
/* All styles consume global CSS tokens from main.css — no local token map needed */

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

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.125rem 1rem;
  animation: fadeUp 300ms ease-out both;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.card-header-icon {
  width: 2.25rem; height: 2.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-header-icon svg { width: 1rem; height: 1rem; color: var(--text-muted); }

.card-header-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}
.card-header-sub { font-size: 0.75rem; color: var(--text-muted); }

.theme-selector {
  display: flex;
  gap: 0.375rem;
  padding: 0.375rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
}
.theme-pill {
  flex: 1;
  padding: 0.5625rem 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.theme-pill:hover { color: var(--text-secondary); }
.theme-pill--active {
  background: var(--accent-muted);
  border-color: var(--accent-border);
  color: var(--accent);
  font-weight: 600;
}

.back-row { display: flex; justify-content: center; }
.back-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  transition: color 150ms, background 150ms;
}
.back-link:hover { color: var(--text-secondary); background: var(--bg-overlay); }
.back-link svg { width: 1rem; height: 1rem; }
</style>