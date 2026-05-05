<script setup lang="ts">
import '@/components/admin/settings/settings.css'
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  latitude: number | null
  longitude: number | null
  radius_meters: number | null
}>()

const emit = defineEmits<{
  (e: 'update:latitude', value: number): void
  (e: 'update:longitude', value: number): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let radiusCircle: L.Circle | null = null
let mapInitialized = false

// ─── Fix Leaflet default marker icons ─────────────────────────────────────────

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

// ─── Place marker + radius circle ───────────────────────────────────────────────

function placeMarker(lat: number, lng: number): void {
  if (!map) return

  // Remove old layers
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
    const newLat = parseFloat(pos.lat.toFixed(7))
    const newLng = parseFloat(pos.lng.toFixed(7))
    emit('update:latitude', newLat)
    emit('update:longitude', newLng)
    updateCircle(newLat, newLng)
  })

  updateCircle(lat, lng)
}

function updateCircle(lat: number, lng: number): void {
  if (!map) return
  if (radiusCircle) map.removeLayer(radiusCircle)

  const radius = props.radius_meters ?? 100

  radiusCircle = L.circle([lat, lng], {
    radius,
    color: '#e8920c',
    fillColor: '#e8920c',
    fillOpacity: 0.1,
    weight: 1.5,
    dashArray: '6, 4',
  }).addTo(map)
}

// ─── Initialize map ───────────────────────────────────────────────────────────

function initMap(): void {
  if (!mapContainer.value || mapInitialized) return
  fixLeafletIcons()
  mapInitialized = true

  const defaultLat = props.latitude ?? -6.2088
  const defaultLng = props.longitude ?? 106.8456

  map = L.map(mapContainer.value, {
    center: [defaultLat, defaultLng],
    zoom: 17,
    zoomControl: true,
  })

  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  // Place initial marker if coords exist
  if (props.latitude && props.longitude) {
    placeMarker(props.latitude, props.longitude)
  }

  // Click to set location
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.on('click', (e: any) => {
    const newLat = parseFloat(e.latlng.lat.toFixed(7))
    const newLng = parseFloat(e.latlng.lng.toFixed(7))
    emit('update:latitude', newLat)
    emit('update:longitude', newLng)
    placeMarker(newLat, newLng)
  })
}

// ─── Watch: update circle when radius changes ──────────────────────────────────

watch(() => props.radius_meters, () => {
  if (props.latitude && props.longitude) {
    updateCircle(props.latitude, props.longitude)
  }
})

// ─── Watch: sync map when coords change from parent (e.g. detect location) ────

watch(() => [props.latitude, props.longitude] as const, () => {
  if (props.latitude && props.longitude && map) {
    map.setView([props.latitude, props.longitude], 18)
    placeMarker(props.latitude, props.longitude)
  }
})

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(initMap)
</script>

<template>
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
        Geofence ({{ radius_meters ?? 100 }}m)
      </span>
    </div>
  </div>
</template>

<style scoped>
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

.card-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--admin-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;
}

.card-title-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--admin-accent);
  flex-shrink: 0;
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
  background: var(--admin-accent);
  box-shadow: 0 0 6px rgba(232, 146, 12, 0.5);
}

.legend-dot--radius {
  background: transparent;
  border: 2px dashed var(--admin-accent);
}
</style>