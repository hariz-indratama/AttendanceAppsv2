<script setup lang="ts">
type Status = 'present' | 'late' | 'absent' | 'half_day'

interface Props {
  status: Status
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
})

const map: Record<Status, { color: string; bg: string }> = {
  present: {
    color: 'var(--emp-success, #10b981)',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  late: {
    color: 'var(--emp-warning, #f59e0b)',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  absent: {
    color: 'var(--emp-danger, #ef4444)',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
  half_day: {
    color: 'var(--emp-accent, #6366f1)',
    bg: 'rgba(99, 102, 241, 0.08)',
  },
}

const displayLabel = props.label
  ? props.label
  : props.status === 'half_day'
    ? 'Half Day'
    : props.status.charAt(0).toUpperCase() + props.status.slice(1)
</script>

<template>
  <span
    class="emp-badge"
    :style="{
      color: map[status].color,
      backgroundColor: map[status].bg,
    }"
  >
    {{ displayLabel }}
  </span>
</template>

<style scoped>
.emp-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  white-space: nowrap;
  line-height: 1.4;
}
</style>
