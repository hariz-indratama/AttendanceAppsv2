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

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Please enter a valid email'
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
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/')
  } else {
    errorMessage.value = result.message || 'Login failed. Please check your credentials.'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Icon + Header -->
      <div class="card-header">
        <div class="icon-wrap">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 13h4l3 4 4-8 3 4h4"/>
          </svg>
        </div>
        <h1 class="title">Admin Portal</h1>
        <p class="subtitle">Sign in to manage</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="form">
        <div class="field">
          <label for="email" class="label">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="admin@example.com"
            class="input"
            :class="{ 'input--error': emailError }"
          />
          <p v-if="emailError" class="field-error">{{ emailError }}</p>
        </div>

        <div class="field">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            class="input"
          />
        </div>

        <button
          type="submit"
          :disabled="!isFormValid || isLoading"
          class="btn"
        >
          <span v-if="isLoading" class="btn-spinner">
            <svg class="spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider"/>

      <!-- Employee Login Link -->
      <p class="alt-link">
        Employee?
        <a href="#" @click.prevent="router.push('/login')" class="link">Use employee login</a>
      </p>
    </div>

    <!-- Footer -->
    <p class="footer">© 2026 Attendance App. All rights reserved.</p>
  </div>
</template>

<style scoped>
:root {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --card-border: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --input-bg: #0f172a;
  --input-border: #334155;
  --accent: #10b981;
  --accent-glow: rgba(16, 185, 129, 0.15);
  --accent-hover: #059669;
  --error-bg: rgba(239, 68, 68, 0.08);
  --error-border: rgba(239, 68, 68, 0.3);
  --error-text: #fca5a5;
}

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  background-image:
    radial-gradient(circle at 50% 0%, var(--accent-glow) 0%, transparent 50%),
    radial-gradient(ellipse at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
  background-size: 100% 100%, 24px 24px;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  padding: 1rem;
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  padding: 2.5rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: var(--accent-glow);
  margin-bottom: 1rem;
  box-shadow: 0 0 2rem var(--accent-glow);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.375rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.75rem;
  color: var(--error-text);
  font-size: 0.8125rem;
  margin-bottom: 1.5rem;
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 0.625rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: border-color 200ms, box-shadow 200ms;
  box-sizing: border-box;
}

.input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input--error {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.04);
}

.field-error {
  font-size: 0.75rem;
  color: #fca5a5;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--accent);
  color: #0f172a;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 0.625rem;
  border: none;
  cursor: pointer;
  transition: background 200ms, transform 100ms;
  box-shadow: 0 4px 1.5rem rgba(16, 185, 129, 0.2);
}

.btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spin {
  width: 1rem;
  height: 1rem;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.divider {
  height: 1px;
  background: var(--card-border);
  margin: 1.5rem 0;
}

.alt-link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.link {
  color: var(--accent);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms;
}

.link:hover {
  color: var(--accent-hover);
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #475569;
  text-align: center;
}
</style>