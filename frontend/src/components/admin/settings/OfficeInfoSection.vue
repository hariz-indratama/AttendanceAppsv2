<script setup lang="ts">
import '@/components/admin/settings/settings.css'

defineProps<{
  office_name: string
  office_address: string
}>()
defineEmits<{
  (e: 'update:office_name', value: string): void
  (e: 'update:office_address', value: string): void
}>()
</script>

<template>
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
          :value="office_name"
          type="text"
          placeholder="e.g. Head Office Jakarta"
          class="field-input"
          @input="$emit('update:office_name', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="field">
        <label class="field-label">Address</label>
        <input
          :value="office_address"
          type="text"
          placeholder="e.g. Jl. Sudirman No. 1, Jakarta"
          class="field-input"
          @input="$emit('update:office_address', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Component-specific overrides only */
</style>