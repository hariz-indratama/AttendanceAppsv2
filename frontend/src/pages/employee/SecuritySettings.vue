<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { useWebAuthn } from '@/composables/useWebAuthn'

const { isSupported: geoSupported, status: geoStatus, enabled: geoEnabled, errorMessage: geoError, enable: enableGeo, disable: disableGeo, loadFromStorage: loadGeo } = useGeolocation()
const { startRegistration, isRegistering } = useWebAuthn()

onMounted(() => loadGeo())

const biometricEnrolled = ref(false)

async function handleGeoToggle() {
  if (geoEnabled.value) {
    disableGeo()
  } else {
    await enableGeo()
  }
}

async function handleBiometricToggle() {
  if (biometricEnrolled.value) {
    biometricEnrolled.value = false
  } else {
    const result = await startRegistration()
    if (result.success) biometricEnrolled.value = true
  }
}

function geoDotColor(): string {
  switch (geoStatus.value) {
    case 'granted': return 'var(--success)'
    case 'checking': return 'var(--accent)'
    case 'denied':
    case 'unavailable': return 'var(--danger)'
    default: return 'var(--text-muted)'
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-eyebrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Settings</span>
      </div>
      <h1 class="page-title">Security</h1>
      <p class="page-subtitle">Biometric and location verification</p>
    </div>

    <div class="settings-list">

      <!-- Biometric Auth -->
      <div class="settings-row">
        <div class="settings-info">
          <p class="settings-label">Biometric Auth</p>
          <p class="settings-desc">Fingerprint / Face ID via WebAuthn</p>
        </div>
        <div class="toggle-group">
          <span v-if="biometricEnrolled" class="enrolled-badge">Enrolled</span>
          <button
            class="toggle"
            :class="{ 'toggle--on': biometricEnrolled }"
            :aria-checked="biometricEnrolled"
            role="switch"
            :disabled="isRegistering"
            @click="handleBiometricToggle"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
      </div>

      <!-- Location Verification -->
      <div class="settings-row">
        <div class="settings-info">
          <p class="settings-label">Location Verification</p>
          <p class="settings-desc">Verify location on clock-in</p>
          <p v-if="geoError" class="geo-error">{{ geoError }}</p>
        </div>
        <div class="toggle-group">
          <span class="status-dot" :style="{ background: geoDotColor() }" :title="geoStatus" />
          <button
            class="toggle"
            :class="{ 'toggle--on': geoEnabled }"
            :aria-checked="geoEnabled"
            role="switch"
            @click="handleGeoToggle"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
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
/* All styles consume global CSS tokens from base.css */
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
.geo-error { font-size: 0.6875rem; color: var(--danger); margin-top: 0.125rem; }

.toggle-group { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

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
.toggle:disabled { opacity: 0.5; cursor: wait; }

.enrolled-badge {
  padding: 0.1875rem 0.5rem;
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--success);
  white-space: nowrap;
}
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 200ms;
  box-shadow: 0 0 4px currentColor;
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
  border-radius: 0.625rem;
  transition: color 150ms, background 150ms;
}
.back-link:hover { color: var(--text-secondary); background: rgba(255,255,255,0.03); }
.back-link svg { width: 1rem; height: 1rem; }
</style>
