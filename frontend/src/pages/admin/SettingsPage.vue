<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import apiClient from '@/api/axios'
import OfficeInfoSection from '@/components/admin/settings/OfficeInfoSection.vue'
import WorkScheduleSection from '@/components/admin/settings/WorkScheduleSection.vue'
import GeofenceSection from '@/components/admin/settings/GeofenceSection.vue'
import CoordinatesSection from '@/components/admin/settings/CoordinatesSection.vue'
import SettingsMap from '@/components/admin/settings/SettingsMap.vue'
import SettingsToast from '@/components/admin/settings/SettingsToast.vue'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Settings {
  company_name: string
  latitude: number | null
  longitude: number | null
  radius_meters: number | null
  work_start: string
  work_end: string
  office_name: string
  office_address: string
}

// ─── State ─────────────────────────────────────────────────────────────────────

const isLoading = ref(true)
const isSaving = ref(false)
const showToast = ref(false)
const saveError = ref('')

const form = ref<Settings>({
  company_name: '',
  latitude: null,
  longitude: null,
  radius_meters: null,
  work_start: '09:00',
  work_end: '18:00',
  office_name: '',
  office_address: '',
})

// ─── Computed v-model values for child components ──────────────────────────────

const office_name = computed({
  get: () => form.value.office_name,
  set: (v: string) => { form.value.office_name = v }
})

const office_address = computed({
  get: () => form.value.office_address,
  set: (v: string) => { form.value.office_address = v }
})

const work_start = computed({
  get: () => form.value.work_start,
  set: (v: string) => { form.value.work_start = v }
})

const work_end = computed({
  get: () => form.value.work_end,
  set: (v: string) => { form.value.work_end = v }
})

const radius_meters = computed({
  get: () => form.value.radius_meters,
  set: (v: number) => { form.value.radius_meters = v }
})

const latitude = computed({
  get: () => form.value.latitude,
  set: (v: number) => { form.value.latitude = v }
})

const longitude = computed({
  get: () => form.value.longitude,
  set: (v: number) => { form.value.longitude = v }
})

// ─── Toast ─────────────────────────────────────────────────────────────────────

let toastTimer: ReturnType<typeof setTimeout> | null = null

function dismissToast(): void {
  showToast.value = false
  if (toastTimer) clearTimeout(toastTimer)
}

function triggerToast(): void {
  showToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(dismissToast, 3500)
}

// ─── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchSettings(): Promise<void> {
  try {
    const res = await apiClient.get<{ data: Settings }>('/admin/settings')
    form.value = { ...form.value, ...res.data.data }
  } catch {
    // fall back to defaults
  } finally {
    isLoading.value = false
  }
}

// ─── Save ──────────────────────────────────────────────────────────────────────

async function saveSettings(): Promise<void> {
  if (!form.value.latitude || !form.value.longitude) {
    saveError.value = 'Please click on the map to set office location.'
    return
  }

  saveError.value = ''
  isSaving.value = true

  try {
    await apiClient.put('/admin/settings', form.value)
    triggerToast()
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Failed to save settings. Please try again.'
    saveError.value = message
  } finally {
    isSaving.value = false
  }
}

// ─── Locate current browser location ───────────────────────────────────────────

function detectMyLocation(): void {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = parseFloat(position.coords.latitude.toFixed(7))
      form.value.longitude = parseFloat(position.coords.longitude.toFixed(7))
    },
    () => {
      saveError.value = 'Could not detect your location. Please click on the map manually.'
    },
    { timeout: 10000 }
  )
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(fetchSettings)
</script>

<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Office &amp; Settings</h1>
        <p class="page-sub">Configure your office location and work schedule</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="settings-grid">
      <div class="settings-form">
        <div class="card">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
        <div class="card">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
        <div class="card">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      </div>
      <div class="skeleton-map"></div>
    </div>

    <!-- Settings form -->
    <div v-else class="settings-grid">
      <!-- Left: Form fields -->
      <div class="settings-form">
        <!-- Error banner -->
        <div v-if="saveError" class="error-banner">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ saveError }}
        </div>

        <!-- Child Components -->
        <OfficeInfoSection
          v-model:office_name="office_name"
          v-model:office_address="office_address"
        />
        <WorkScheduleSection
          v-model:work_start="work_start"
          v-model:work_end="work_end"
        />
        <GeofenceSection
          v-model:radius_meters="radius_meters"
        />
        <CoordinatesSection
          v-model:latitude="latitude"
          v-model:longitude="longitude"
          @detect="detectMyLocation"
        />

        <!-- Save Button -->
        <button
          type="button"
          :disabled="isSaving"
          class="btn-save"
          @click="saveSettings"
        >
          <svg v-if="!isSaving" class="btn-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="btn-save-icon btn-save-icon--spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.3"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ isSaving ? 'Saving…' : 'Save Settings' }}
        </button>
      </div>

      <!-- Right: Map -->
      <SettingsMap
        v-model:latitude="latitude"
        v-model:longitude="longitude"
        v-model:radius_meters="radius_meters"
      />
    </div>

    <!-- Success Toast -->
    <SettingsToast :show="showToast" @dismiss="dismissToast" />
  </div>
</template>

<style scoped>
/* ─── Tokens ──────────────────────────────────────────────────────────────── */
.settings-page {
  --admin-bg: #0a0f1e;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --card-hover: #162032;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #e8920c;
  --admin-accent-muted: rgba(232, 146, 12, 0.08);
  --accent-border: rgba(232, 146, 12, 0.3);
  --success: #34d399;
  --success-muted: rgba(52, 211, 153, 0.1);
  --admin-danger: #f87171;
  --admin-danger-muted: rgba(248, 113, 113, 0.08);
  --input-bg: #0f1d35;
  --input-border: #1e2d45;
  --input-focus-border: #e8920c;
  --font-display: 'Syne', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;
}

/* ─── Page layout ─────────────────────────────────────────────────────────── */
.settings-page {
  min-height: 100%;
  background: var(--admin-bg);
  font-family: var(--font-body);
  color: var(--admin-text);
  padding: 1.75rem 1.5rem 3rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--admin-text);
  line-height: 1.1;
}

.page-sub {
  font-size: 0.875rem;
  color: var(--admin-text-secondary);
  margin-top: 0.25rem;
}

/* ─── Grid ────────────────────────────────────────────────────────────────── */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Form column ─────────────────────────────────────────────────────────── */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: 1.25rem;
  padding: 1.375rem 1.5rem;
}

/* ─── Error banner ────────────────────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--admin-danger-muted);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.75rem;
  color: var(--admin-danger);
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* ─── Save button ────────────────────────────────────────────────────────── */
.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.9375rem 1.25rem;
  background: linear-gradient(135deg, #e8920c 0%, #f59e0b 100%);
  color: #0a0f1a;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 1.5rem rgba(232, 146, 12, 0.25);
  transition: transform 150ms, box-shadow 150ms, opacity 150ms;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 2rem rgba(232, 146, 12, 0.35);
}

.btn-save:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.btn-save-icon--spin {
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── Loading skeleton ────────────────────────────────────────────────────── */
.skeleton-line {
  height: 0.875rem;
  background: var(--admin-border);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line--title {
  width: 40%;
  height: 1rem;
  margin-bottom: 1rem;
}

.skeleton-line--short {
  width: 55%;
}

.skeleton-map {
  height: 500px;
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: 1.25rem;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 0.8; }
}
</style>