<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  name: string
  size?: AvatarSize
}>(), {
  size: 'md',
})

const initials = computed(() => {
  const first = props.name.trim().charAt(0).toUpperCase()
  return first || '?'
})

const sizeValue = computed(() => {
  const map: Record<AvatarSize, string> = {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
  }
  return map[props.size]
})

const fontSize = computed(() => {
  const map: Record<AvatarSize, string> = {
    sm: '0.75rem',
    md: '0.875rem',
    lg: '1rem',
  }
  return map[props.size]
})
</script>

<template>
  <span
    class="admin-avatar"
    :style="{
      width: sizeValue,
      height: sizeValue,
      fontSize: fontSize,
    }"
    :title="name"
    role="img"
    :aria-label="name"
  >
    {{ initials }}
  </span>
</template>

<style scoped>
.admin-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-admin-muted);
  color: var(--accent-admin);
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
  letter-spacing: -0.01em;
}
</style>