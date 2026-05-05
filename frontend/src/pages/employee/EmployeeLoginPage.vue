<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Enter a valid email address'
})

const isFormValid = computed(() => {
  return email.value.length > 0 &&
    password.value.length > 0 &&
    !emailError.value
})

async function handleLogin() {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    email: email.value,
    password: password.value,
  })

  isLoading.value = false

  if (result.success) {
    localStorage.setItem('user_role', authStore.user?.role || 'employee')
    router.push('/')
  } else {
    errorMessage.value = result.message || 'Login failed. Please check your credentials.'
  }
}
</script>

<template>
  <div class="empl-login login-root">
    <!-- Left brand panel -->
    <div class="brand-panel">
      <div class="brand-blob" aria-hidden="true">
        <div class="blob-inner"/>
        <div class="blob-glow"/>
      </div>

      <div class="brand-content">
        <!-- Clock illustration -->
        <div class="clock-wrap">
          <svg class="clock-svg" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="52" stroke="rgba(194,65,12,0.25)" stroke-width="2"/>
            <circle cx="60" cy="60" r="52" stroke="url(#clockGrad)" stroke-width="2" stroke-dasharray="8 4" stroke-dashoffset="4"/>
            <circle cx="60" cy="60" r="38" fill="rgba(194,65,12,0.06)" stroke="rgba(194,65,12,0.2)" stroke-width="1"/>
            <!-- Hour markers -->
            <circle cx="60" cy="14" r="2.5" fill="#c2410c" fill-opacity="0.7"/>
            <circle cx="106" cy="60" r="2.5" fill="#c2410c" fill-opacity="0.7"/>
            <circle cx="60" cy="106" r="2.5" fill="#c2410c" fill-opacity="0.7"/>
            <circle cx="14" cy="60" r="2.5" fill="#c2410c" fill-opacity="0.7"/>
            <!-- Clock hands -->
            <line x1="60" y1="60" x2="60" y2="30" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="60" y1="60" x2="82" y2="72" stroke="#1c1917" stroke-width="2" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="4" fill="#c2410c"/>
            <circle cx="60" cy="60" r="1.5" fill="#fff"/>
            <defs>
              <linearGradient id="clockGrad" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stop-color="#c2410c" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div class="brand-text">
          <h1 class="brand-name">Attendance</h1>
          <p class="brand-tagline">Track your time, effortlessly.</p>
        </div>
      </div>

      <!-- Wave bottom -->
      <div class="wave-wrap" aria-hidden="true">
        <svg viewBox="0 0 500 80" preserveAspectRatio="none">
          <path d="M0,40 C80,80 160,0 240,40 C320,80 400,0 500,40 L500,80 L0,80 Z" fill="rgba(194,65,12,0.12)"/>
        </svg>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="form-panel">
      <div class="form-inner">
        <!-- Icon -->
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="form-header">
          <h2 class="form-title">Ready to clock in?</h2>
          <p class="form-sub">Sign in to track your attendance</p>
        </div>

        <!-- Error Alert -->
        <transition name="alert-slide">
          <div v-if="errorMessage" class="error-alert">
            <svg class="alert-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label for="email" class="field-label">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@company.com"
              class="field-input"
              :class="{ 'is-error': emailError }"
            />
            <p v-if="emailError" class="field-err">{{ emailError }}</p>
          </div>

          <div class="field">
            <label for="password" class="field-label">Password</label>
            <div class="input-wrap">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Your password"
                class="field-input has-suffix"
              />
              <button
                type="button"
                class="toggle-pw"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a18.5 18.5 0 015.625-4.95M9.53 9.53A4.5 4.5 0 0012 6c3.18 0 5.425 2.035 6.7 4.95M1 1l22 22"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="submit-btn"
          >
            <span v-if="isLoading" class="loading-wrap">
              <svg class="spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Admin link -->
        <div class="alt-action">
          <span>Admin user?</span>
          <a href="#" @click.prevent="router.push('/admin/login')" class="alt-link">
            Use admin portal
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </a>
        </div>

        <p class="form-footer">© 2026 Attendance App</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root layout ─────────────────────────────────── */
.login-root {
  display: grid;
  grid-template-columns: 45% 1fr;
  min-height: 100vh;
  font-family: var(--empl-font-body);
  background: var(--empl-bg);
  color: var(--empl-text);
}

@media (max-width: 768px) {
  .login-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

/* ── Left brand panel ───────────────────────────── */
.brand-panel {
  position: relative;
  background: var(--empl-bg);
  background-image: radial-gradient(circle at 30% 40%, rgba(194,65,12,0.08) 0%, transparent 55%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: panelFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelFadeUp {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Animated blob */
.brand-blob {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.blob-inner {
  width: 320px;
  height: 320px;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  background: radial-gradient(ellipse at 40% 40%, rgba(245,158,11,0.14), rgba(194,65,12,0.07));
  animation: blobMorph 8s ease-in-out infinite;
}

.blob-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
  animation: blobGlow 3s ease-in-out infinite alternate;
}

@keyframes blobMorph {
  0%   { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: scale(1) rotate(0deg); }
  50%  { border-radius: 40% 60% 30% 70% / 60% 40% 50% 60%; transform: scale(1.05) rotate(5deg); }
  100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: scale(1) rotate(0deg); }
}

@keyframes blobGlow {
  from { transform: scale(0.9); opacity: 0.6; }
  to   { transform: scale(1.1); opacity: 1; }
}

/* Brand content */
.brand-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 3rem 2rem 2rem;
  text-align: center;
}

.clock-wrap {
  width: 120px;
  height: 120px;
  margin-bottom: 2rem;
  animation: clockFloat 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(194,65,12,0.18));
}

@keyframes clockFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.clock-svg { width: 100%; height: 100%; }

.brand-text { margin-top: 0.5rem; }

.brand-name {
  font-family: var(--empl-font-display);
  font-size: 1.75rem;
  font-weight: 700;
  font-variation-settings: 'opsz' 72;
  color: var(--empl-text);
  letter-spacing: -0.02em;
  line-height: 1;
}

.brand-tagline {
  font-size: 0.9375rem;
  color: var(--empl-muted);
  margin-top: 0.5rem;
  font-weight: 400;
}

/* Wave */
.wave-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
}

.wave-wrap svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Right form panel ───────────────────────────── */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--empl-bg);
  animation: formSlideUp 600ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes formSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form-inner {
  width: 100%;
  max-width: 380px;
}

/* Icon */
.form-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--empl-accent-muted);
  border: 1px solid var(--empl-accent-light);
  color: var(--empl-accent);
  margin-bottom: 1.25rem;
}

.form-icon svg { width: 22px; height: 22px; }

/* Form header */
.form-header { margin-bottom: 1.75rem; }

.form-title {
  font-family: var(--empl-font-display);
  font-size: 1.625rem;
  font-weight: 700;
  font-variation-settings: 'opsz' 72;
  color: var(--empl-text);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.form-sub {
  font-size: 0.9375rem;
  color: var(--empl-muted);
  margin-top: 0.375rem;
}

/* Error alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--empl-danger-muted);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px;
  color: var(--empl-danger);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.alert-svg { width: 16px; height: 16px; flex-shrink: 0; }

.alert-slide-enter-active,
.alert-slide-leave-active { transition: all 250ms ease; }
.alert-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.alert-slide-leave-to     { opacity: 0; transform: translateY(-8px); }

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field { display: flex; flex-direction: column; gap: 0.375rem; }

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--empl-muted);
  font-family: var(--empl-font-body);
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--empl-surface-alt);
  border: 1.5px solid transparent;
  border-radius: 10px;
  color: var(--empl-text) !important;
  font-family: var(--empl-font-body);
  font-size: 0.9375rem;
  transition: border-color 200ms, box-shadow 200ms, background 200ms;
  box-sizing: border-box;
}

.field-input::placeholder { color: var(--empl-placeholder); }

.field-input:focus {
  outline: none;
  border-color: var(--empl-accent);
  background: var(--empl-surface);
  box-shadow: 0 0 0 3px var(--empl-accent-muted);
}

.field-input.is-error {
  border-color: rgba(220, 38, 38, 0.5);
  background: var(--empl-danger-muted);
}

/* Autofill */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus,
.field-input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--empl-text) !important;
  -webkit-box-shadow: 0 0 0 1000px var(--empl-surface-alt) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.field-err {
  font-size: 0.75rem;
  color: var(--empl-danger);
}

/* Password toggle */
.input-wrap { position: relative; }
.has-suffix  { padding-right: 2.75rem; }

.toggle-pw {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--empl-placeholder);
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 150ms;
  display: flex;
  align-items: center;
}

.toggle-pw:hover { color: var(--empl-muted); }
.toggle-pw svg   { width: 18px; height: 18px; }

/* Submit */
.submit-btn {
  width: 100%;
  padding: 0.8125rem 1rem;
  background: var(--empl-accent);
  color: #fff;
  font-family: var(--empl-font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 200ms, box-shadow 200ms, transform 120ms;
  box-shadow: 0 4px 16px rgba(194, 65, 12, 0.2);
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--empl-accent-hover);
  box-shadow: 0 6px 20px rgba(194, 65, 12, 0.3);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }

.submit-btn:disabled {
  background: var(--empl-border);
  color: var(--empl-placeholder);
  cursor: not-allowed;
  box-shadow: none;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spin {
  width: 16px;
  height: 16px;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Alt action */
.alt-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--empl-muted);
}

.alt-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--empl-accent);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms, gap 150ms;
}

.alt-link:hover { color: var(--empl-accent-hover); gap: 0.375rem; }
.alt-link svg  { width: 14px; height: 14px; transition: transform 150ms; }
.alt-link:hover svg { transform: translateX(2px); }

/* Footer */
.form-footer {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: var(--empl-placeholder);
  text-align: center;
  opacity: 0.7;
}

/* ── Mobile ─────────────────────────────────────── */
@media (max-width: 768px) {
  .brand-panel {
    min-height: 200px;
    padding: 2rem 1.5rem;
  }

  .brand-blob { display: none; }

  .brand-content {
    padding: 1.5rem 1.5rem;
    justify-content: center;
  }

  .clock-wrap { width: 80px; height: 80px; margin-bottom: 1rem; }
  .brand-name { font-size: 1.5rem; }
  .brand-tagline { font-size: 0.875rem; }

  .form-panel {
    animation-name: formSlideUp;
    padding: 1.5rem;
    align-items: flex-start;
  }
}
</style>