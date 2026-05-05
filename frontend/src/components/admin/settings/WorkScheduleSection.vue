<script setup lang="ts">
import '@/components/admin/settings/settings.css'

defineProps<{
  work_start: string
  work_end: string
}>()
defineEmits<{
  (e: 'update:work_start', value: string): void
  (e: 'update:work_end', value: string): void
}>()
</script>

<template>
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
        <input
          :value="work_start"
          type="time"
          class="field-input"
          @input="$emit('update:work_start', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="field-divider">—</div>
      <div class="field">
        <label class="field-label">End Time</label>
        <input
          :value="work_end"
          type="time"
          class="field-input"
          @input="$emit('update:work_end', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Component-specific overrides only */
</style>