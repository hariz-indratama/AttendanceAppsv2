<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/auth'
import ProfileStats from './ProfileStats.vue'

const props = defineProps<{
  user: User
  hoursThisMonth: number
  daysWorked: number
  lateCount: number
  isLoadingStats: boolean
  monthLabel: string
}>()

const memberSince = computed(() => {
  if (!props.user?.created_at) return 'Unknown'
  return new Date(props.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const isBiometricEnrolled = computed(() => false)
const biometricLabel = computed(() => isBiometricEnrolled.value ? 'Enrolled' : 'Not Enrolled')
</script>

<template>
  <div class="tab-content">
    <!-- User Info -->
    <div class="card" style="animation-delay: 120ms">
      <h3 class="card-title">User Information</h3>
      <dl class="info-list">
        <div class="info-row">
          <dt class="info-key">Full Name</dt>
          <dd class="info-val">{{ user?.name ?? '—' }}</dd>
        </div>
        <div class="info-divider" />
        <div class="info-row">
          <dt class="info-key">Email</dt>
          <dd class="info-val">{{ user?.email ?? '—' }}</dd>
        </div>
        <div class="info-divider" />
        <div class="info-row">
          <dt class="info-key">Role</dt>
          <dd class="info-val capitalize">{{ (user?.role ?? 'employee').toLowerCase() }}</dd>
        </div>
        <div class="info-divider" />
        <div class="info-row">
          <dt class="info-key">Member Since</dt>
          <dd class="info-val">{{ memberSince }}</dd>
        </div>
      </dl>
    </div>

    <!-- Work Stats -->
    <ProfileStats
      :hoursThisMonth="hoursThisMonth"
      :daysWorked="daysWorked"
      :lateCount="lateCount"
      :isLoading="isLoadingStats"
    />

    <!-- Biometric -->
    <div class="card" style="animation-delay: 200ms">
      <h3 class="card-title">Biometric Authentication</h3>
      <div class="bio-row">
        <div class="bio-icon" :class="isBiometricEnrolled ? 'bio-icon--ok' : 'bio-icon--muted'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <div class="bio-info">
          <p class="bio-name">WebAuthn</p>
          <p class="bio-sub">Fingerprint / Face ID</p>
        </div>
        <span class="bio-badge" :class="isBiometricEnrolled ? 'bio-badge--ok' : 'bio-badge--muted'">
          {{ biometricLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.025) inset,
    0 2px 4px rgba(0,0,0,0.3),
    0 16px 32px -4px rgba(0,0,0,0.4);
  animation: fadeUp 300ms ease-out both;
}

.card-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
}

.info-key {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.info-val {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: right;
}

.info-divider {
  height: 1px;
  background: var(--border);
}

.bio-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.bio-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bio-icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.bio-icon--ok {
  background: var(--success-muted);
  color: var(--success);
}

.bio-icon--muted {
  background: var(--bg);
  color: var(--text-muted);
}

.bio-info {
  flex: 1;
}

.bio-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bio-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.bio-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
}

.bio-badge--ok {
  color: var(--success);
  border-color: rgba(52,211,153,0.3);
  background: var(--success-muted);
}

.bio-badge--muted {
  color: var(--text-muted);
  border-color: var(--border);
  background: var(--bg);
}
</style>
