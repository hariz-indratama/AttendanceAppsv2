<script setup lang="ts">
import '@/components/admin/settings/settings.css'

defineProps<{
  show: boolean
}>()
defineEmits<{
  (e: 'dismiss'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="toast-enter" leave-active-class="toast-leave">
      <div v-if="show" class="toast">
        <div class="toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <span>Settings saved successfully</span>
        <button @click="$emit('dismiss')" class="toast-close" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Component-specific styles for toast */
</style>