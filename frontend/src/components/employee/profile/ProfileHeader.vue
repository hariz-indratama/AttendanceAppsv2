<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/auth'

const props = defineProps<{
  user: User
}>()

const initials = computed(() => {
  const name = props.user?.name ?? 'U'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return parts.length >= 2
    ? ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase()
})

const memberSince = computed(() => {
  if (!props.user?.created_at) return 'Unknown'
  return new Date(props.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="avatar-card" style="animation-delay: 0ms">
    <div class="avatar-ring">
      <span class="avatar-initials">{{ initials }}</span>
    </div>
    <h2 class="avatar-name">{{ user?.name ?? '—' }}</h2>
    <p class="avatar-email">{{ user?.email ?? '—' }}</p>
    <span class="role-badge" :class="user?.role === 'admin' ? 'role-badge--admin' : 'role-badge--employee'">
      {{ user?.role === 'admin' ? 'Admin' : 'Employee' }}
    </span>
  </div>
</template>

<style scoped>
.avatar-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.avatar-ring {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: rgba(232, 146, 12, 0.08);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.875rem;
}

.avatar-initials {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--accent);
}

.avatar-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.avatar-email {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.role-badge {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.25rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: 1px solid;
}

.role-badge--employee {
  color: var(--accent);
  border-color: rgba(232,146,12,0.3);
  background: var(--accent-muted);
}

.role-badge--admin {
  color: #a78bfa;
  border-color: rgba(167,139,250,0.3);
  background: rgba(167,139,250,0.08);
}
</style>
