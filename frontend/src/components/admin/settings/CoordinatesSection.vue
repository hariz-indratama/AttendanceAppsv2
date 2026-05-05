<script setup lang="ts">
import '@/components/admin/settings/settings.css'

defineProps<{
  latitude: number | null
  longitude: number | null
}>()
defineEmits<{
  (e: 'update:latitude', value: number): void
  (e: 'update:longitude', value: number): void
  (e: 'detect'): void
}>()
</script>

<template>
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
          :value="latitude"
          type="number"
          step="any"
          placeholder="-6.2088000"
          class="field-input field-input--mono"
          @input="$emit('update:latitude', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
      <div class="field">
        <label class="field-label">Longitude</label>
        <input
          :value="longitude"
          type="number"
          step="any"
          placeholder="106.8456000"
          class="field-input field-input--mono"
          @input="$emit('update:longitude', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>
    <div class="coords-actions">
      <button type="button" class="btn-outline" @click="$emit('detect')">
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
      <p v-if="latitude && longitude" class="coords-status">
        <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {{ latitude.toFixed(5) }}, {{ longitude.toFixed(5) }}
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Component-specific overrides only */
</style>