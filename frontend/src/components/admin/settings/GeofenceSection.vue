<script setup lang="ts">
import '@/components/admin/settings/settings.css'

defineProps<{
  radius_meters: number | null
}>()
defineEmits<{
  (e: 'update:radius_meters', value: number): void
}>()
</script>

<template>
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
          :value="radius_meters"
          type="number"
          min="10"
          max="2000"
          step="10"
          placeholder="100"
          class="field-input field-input--unit"
          @input="$emit('update:radius_meters', Number(($event.target as HTMLInputElement).value))"
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
        :class="{ 'quick-btn--active': radius_meters === r }"
        @click="$emit('update:radius_meters', r)"
        type="button"
      >
        {{ r }}m
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Component-specific overrides only */
</style>