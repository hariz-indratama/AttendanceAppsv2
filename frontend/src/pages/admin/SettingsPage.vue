<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import apiClient from '@/api/axios'
import L from 'leaflet'

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

// ─── Leaflet map refs ──────────────────────────────────────────────────────────

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let radiusCircle: L.Circle | null = null
let mapInitialized = false

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

// ─── Map: fix default marker icons ─────────────────────────────────────────────

function fixLeafletIcons(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconPrototype = (L.Icon.Default.prototype as any)
  iconPrototype.options.iconUrl = new URL(
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    import.meta.url
  ).href
  iconPrototype.options.iconRetinaUrl = new URL(
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    import.meta.url
  ).href
  iconPrototype.options.shadowUrl = new URL(
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    import.meta.url
  ).href
}

// ─── Map: init ────────────────────────────────────────────────────────────────

function initMap(): void {
  if (!mapContainer.value || mapInitialized) return
  fixLeafletIcons()
  mapInitialized = true

  const defaultLat = form.value.latitude ?? -6.2088
  const defaultLng = form.value.longitude ?? 106.8456

  map = L.map(mapContainer.value, {
    center: [defaultLat, defaultLng],
    zoom: 17,
    zoomControl: true,
  })

  // Dark tile layer (CartoDB Dark Matter — free, no API key)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  // Place initial marker + circle if coords exist
  if (form.value.latitude && form.value.longitude) {
    placeMarker(form.value.latitude, form.value.longitude)
  }

  // Click to set location
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.on('click', (e: any) => {
    form.value.latitude = parseFloat(e.latlng.lat.toFixed(7))
    form.value.longitude = parseFloat(e.latlng.lng.toFixed(7))
    placeMarker(e.latlng.lat, e.latlng.lng)
  })
}

// ─── Map: place marker + radius ────────────────────────────────────────────────

function placeMarker(lat: number, lng: number): void {
  if (!map) return

  // Remove old marker
  if (marker) {
    map.removeLayer(marker)
    marker = null
  }
  if (radiusCircle) {
    map.removeLayer(radiusCircle)
    radiusCircle = null
  }

  // Amber marker icon
  const amberIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      background: #e8920c;
      border: 3px solid #f1f5f9;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(232,146,12,0.4), 0 4px 12px rgba(0,0,0,0.6);
      cursor: pointer;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  marker = L.marker([lat, lng], { icon: amberIcon, draggable: true }).addTo(map)

  marker.on('dragend', () => {
    const pos = marker!.getLatLng()
    form.value.latitude = parseFloat(pos.lat.toFixed(7))
    form.value.longitude = parseFloat(pos.lng.toFixed(7))
    updateCircle(lat, lng)
  })

  updateCircle(lat, lng)
}

function updateCircle(lat: number, lng: number): void {
  if (!map) return
  if (radiusCircle) map.removeLayer(radiusCircle)

  const radius = form.value.radius_meters ?? 100

  radiusCircle = L.circle([lat, lng], {
    radius,
    color: '#e8920c',
    fillColor: '#e8920c',
    fillOpacity: 0.1,
    weight: 1.5,
    dashArray: '6, 4',
  }).addTo(map)
}

// ─── Watch: update circle when radius changes ──────────────────────────────────

watch(() => form.value.radius_meters, () => {
  if (form.value.latitude && form.value.longitude) {
    updateCircle(form.value.latitude, form.value.longitude)
  }
})

// ─── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchSettings(): Promise<void> {
  try {
    const res = await apiClient.get<{ data: Settings }>('/admin/settings')
    form.value = { ...form.value, ...res.data.data }
  } catch {
    // fall back to defaults
  } finally {
    isLoading.value = false
    await nextTick()
    initMap()
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

async function detectMyLocation(): Promise<void> {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = parseFloat(position.coords.latitude.toFixed(7))
      const lng = parseFloat(position.coords.longitude.toFixed(7))
      form.value.latitude = lat
      form.value.longitude = lng

      if (map) {
        map.setView([lat, lng], 18)
        placeMarker(lat, lng)
      }
    },
    () => {
      saveError.value = 'Could not detect your location. Please click on the map manually.'
    },
    { timeout: 10000 }
  )
}

// ─── Sync map when user edits lat/lng manually ──────────────────────────────────

function syncMapFromInput(): void {
  if (form.value.latitude && form.value.longitude && map) {
    map.setView([form.value.latitude, form.value.longitude], 18)
    placeMarker(form.value.latitude, form.value.longitude)
  }
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
      <div class="card">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line--short"></div>
      </div>
      <div class="card skeleton-map"></div>
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

        <!-- Office Info -->
        <section class="card">
          <h2 class="card-title">
            <svg class="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Office Information
          </h2>

          <div class="field-group">
            <div class="field">
              <label class="field-label">Office Name</label>
              <input
                v-model="form.office_name"
                type="text"
                placeholder="e.g. Head Office Jakarta"
                class="field-input"
              />
            </div>
            <div class="field">
              <label class="field-label">Address</label>
              <input
                v-model="form.office_address"
                type="text"
                placeholder="e.g. Jl. Sudirman No. 1, Jakarta"
                class="field-input"
              />
            </div>
          </div>
        </section>

        <!-- Work Schedule -->
        <section class="card">
          <h2 class="card-title">
            <svg class="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Work Schedule
          </h2>

          <div class="field-row">
            <div class="field">
              <label class="field-label">Start Time</label>
              <input v-model="form.work_start" type="time" class="field-input" />
            </div>
            <div class="field-divider">—</div>
            <div class="field">
              <label class="field-label">End Time</label>
              <input v-model="form.work_end" type="time" class="field-input" />
            </div>
          </div>
        </section>

        <!-- Geofence Radius -->
        <section class="card">
          <h2 class="card-title">
            <svg class="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Geofence Radius
          </h2>

          <div class="field">
            <label class="field-label">Allowed Radius (meters)</label>
            <div class="input-with-unit">
              <input
                v-model.number="form.radius_meters"
                type="number"
                min="10"
                max="2000"
                step="10"
                placeholder="100"
                class="field-input field-input--unit"
              />
              <span class="unit-label">m</span>
            </div>
            <p class="field-hint">Employees must be within this radius to clock in.</p>
          </div>

          <div class="quick-radius">
            <span class="quick-radius-label">Quick set:</span>
            <button
              v-for="r in [50, 100, 200, 500]"
              :key="r"
              class="quick-btn"
              :class="{ 'quick-btn--active': form.radius_meters === r }"
              @click="form.radius_meters = r"
              type="button"
            >
              {{ r }}m
            </button>
          </div>
        </section>

        <!-- Coordinates (manual + detect) -->
        <section class="card">
          <h2 class="card-title">
            <svg class="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.5-7.5 11.5S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            Coordinates
          </h2>

          <div class="coords-grid">
            <div class="field">
              <label class="field-label">Latitude</label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="any"
                placeholder="-6.2088000"
                class="field-input field-input--mono"
                @change="syncMapFromInput()"
              />
            </div>
            <div class="field">
              <label class="field-label">Longitude</label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="any"
                placeholder="106.8456000"
                class="field-input field-input--mono"
                @change="syncMapFromInput()"
              />
            </div>
          </div>

          <div class="coords-actions">
            <button type="button" class="btn-outline" @click="detectMyLocation">
              <svg class="btn-outline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
              Detect My Location
            </button>
            <p v-if="form.latitude && form.longitude" class="coords-status">
              <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              {{ form.latitude.toFixed(5) }}, {{ form.longitude.toFixed(5) }}
            </p>
          </div>
        </section>

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

      <!-- Right: Leaflet Map -->
      <div class="map-card">
        <div class="map-header">
          <h2 class="card-title">
            <svg class="card-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            Office Location
          </h2>
          <p class="map-hint">Click anywhere on the map to set office location</p>
        </div>

        <div ref="mapContainer" class="map-container" />

        <div class="map-legend">
          <span class="legend-item">
            <span class="legend-dot legend-dot--marker"></span>
            Office
          </span>
          <span class="legend-item">
            <span class="legend-dot legend-dot--radius"></span>
            Geofence ({{ form.radius_meters ?? 100 }}m)
          </span>
        </div>
      </div>
    </div>

    <!-- Success toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="toast-enter"
        leave-active-class="toast-leave"
      >
        <div v-if="showToast" class="toast">
          <div class="toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span>Settings saved successfully</span>
          <button @click="dismissToast" class="toast-close" aria-label="Dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
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

.card-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--admin-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.125rem;
  letter-spacing: -0.01em;
}

.card-title-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--admin-accent);
  flex-shrink: 0;
}

/* ─── Fields ──────────────────────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-divider {
  color: var(--admin-text-muted);
  font-size: 1.25rem;
  padding-top: 1.5rem;
  flex-shrink: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.field-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--admin-text-secondary);
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: 0.75rem;
  color: var(--admin-text);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  transition: border-color 200ms, box-shadow 200ms;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.field-input::placeholder {
  color: var(--admin-text-muted);
}

.field-input:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(232, 146, 12, 0.15);
}

.field-input--mono {
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.field-input--unit {
  padding-right: 2.5rem;
}

.input-with-unit {
  position: relative;
}

.unit-label {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  pointer-events: none;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--admin-text-muted);
  margin-top: 0.25rem;
}

/* ─── Quick radius buttons ────────────────────────────────────────────────── */
.quick-radius {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.quick-radius-label {
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.quick-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  color: var(--admin-text-secondary);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}

.quick-btn:hover {
  background: var(--admin-accent-muted);
  border-color: var(--accent-border);
  color: var(--admin-accent);
}

.quick-btn--active {
  background: var(--admin-accent-muted);
  border-color: var(--accent-border);
  color: var(--admin-accent);
}

/* ─── Coords actions ──────────────────────────────────────────────────────── */
.coords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.coords-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.875rem;
  flex-wrap: wrap;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: 1px solid var(--admin-border);
  border-radius: 0.625rem;
  color: var(--admin-text-secondary);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}

.btn-outline:hover {
  background: var(--card-hover);
  border-color: var(--admin-text-muted);
  color: var(--admin-text);
}

.btn-outline-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.coords-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--success);
}

.status-icon {
  width: 0.875rem;
  height: 0.875rem;
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

/* ─── Backdrop / overlay overrides ─────────────────────────────────────── */
:deep(.bg-black\/30) {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

/* ─── Map card ────────────────────────────────────────────────────────────── */
.map-card {
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: 1.25rem;
  overflow: hidden;
  position: sticky;
  top: 1.5rem;
}

.map-header {
  padding: 1.375rem 1.5rem 1rem;
  border-bottom: 1px solid var(--admin-border);
}

.map-hint {
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
  margin-top: 0.25rem;
  margin-left: 1.625rem;
}

.map-container {
  height: 420px;
  width: 100%;
  background: #0a0f1a;
}

/* Override Leaflet styles for dark theme */
:deep(.leaflet-container) {
  background: #0a0f1a;
  font-family: var(--font-body);
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.leaflet-control-zoom a) {
  background: var(--admin-card) !important;
  color: var(--admin-text-secondary) !important;
  border: 1px solid var(--admin-border) !important;
  width: 2rem !important;
  height: 2rem !important;
  line-height: 2rem !important;
  font-size: 1rem !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: var(--card-hover) !important;
  color: var(--admin-text) !important;
}

:deep(.leaflet-control-zoom-in) {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

:deep(.leaflet-control-zoom-out) {
  border-radius: 0 0 0.5rem 0.5rem !important;
}

:deep(.leaflet-control-attribution) {
  background: rgba(10, 15, 30, 0.8) !important;
  color: var(--admin-text-muted) !important;
  font-size: 0.625rem !important;
}

:deep(.leaflet-control-attribution a) {
  color: var(--admin-text-muted) !important;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--admin-border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.legend-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot--marker {
  background: var(--accent);
  box-shadow: 0 0 6px rgba(232, 146, 12, 0.5);
}

.legend-dot--radius {
  background: transparent;
  border: 2px dashed var(--accent);
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 9999;
  background: var(--admin-card);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 0.875rem;
  padding: 0.875rem 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  box-shadow: 0 8px 2rem rgba(0, 0, 0, 0.5);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--success);
}

.toast-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--success-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--success);
}

.toast-close {
  margin-left: 0.5rem;
  background: transparent;
  border: none;
  color: var(--admin-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.125rem;
  transition: color 150ms;
}

.toast-close:hover {
  color: var(--admin-text-secondary);
}

.toast-close svg {
  width: 0.875rem;
  height: 0.875rem;
}

.toast-enter {
  animation: toastSlideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave {
  animation: toastFadeOut 200ms ease-in forwards;
}

@keyframes toastSlideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toastFadeOut {
  to { opacity: 0; transform: translateY(8px) scale(0.96); }
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