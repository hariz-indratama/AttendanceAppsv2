<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

const emailError = computed(() => {
  if (!email.value) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value) ? "" : "Enter a valid email address";
});

const isFormValid = computed(() => {
  return (
    email.value.length > 0 && password.value.length > 0 && !emailError.value
  );
});

async function handleLogin() {
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = "";

  const result = await authStore.login({
    email: email.value,
    password: password.value,
  });

  isLoading.value = false;

  if (result.success) {
    localStorage.setItem("user_role", authStore.user?.role || "employee");
    router.push("/");
  } else {
    errorMessage.value =
      result.message || "Login failed. Please check your credentials.";
  }
}
</script>

<template>
  <div class="adm-login login-root">
    <!-- Left brand panel -->
    <div class="brand-panel">
      <div class="brand-inner">
        <!-- Logo mark -->
        <div class="logo-mark">
          <svg viewBox="0 0 40 40" fill="none">
            <rect
              x="2"
              y="2"
              width="36"
              height="36"
              rx="8"
              fill="#6366f1"
              fill-opacity="0.15"
            />
            <rect
              x="2"
              y="2"
              width="36"
              height="36"
              rx="8"
              stroke="#6366f1"
              stroke-width="1.5"
            />
            <path
              d="M12 20h16M20 12v16"
              stroke="#6366f1"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="20" cy="20" r="4" fill="#22d3ee" />
          </svg>
        </div>

        <div class="brand-text">
          <h1 class="brand-name">Attendance</h1>
          <p class="brand-role">Admin Portal</p>
        </div>

        <!-- Decorative grid lines -->
        <div class="grid-lines" aria-hidden="true">
          <span v-for="n in 6" :key="n" class="grid-line" />
        </div>

        <!-- Bottom tagline -->
        <div class="brand-footer">
          <p class="brand-tagline">
            Manage your workforce<br />from a single command center.
          </p>
          <div class="accent-line" aria-hidden="true" />
        </div>
      </div>

      <!-- Scanning animation line -->
      <div class="scan-line" aria-hidden="true" />
    </div>

    <!-- Right form panel -->
    <div class="form-panel">
      <div class="form-inner">
        <div class="form-header">
          <div class="form-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 class="form-title">Welcome back</h2>
          <p class="form-sub">Sign in to your admin account</p>
        </div>

        <!-- Error Alert -->
        <transition name="alert-slide">
          <div v-if="errorMessage" class="error-alert">
            <svg class="alert-svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
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
              placeholder="admin@company.com"
              class="field-input"
              :class="{ 'is-error': emailError }"
            />
            <p v-if="emailError" class="field-err">{{ emailError }}</p>
          </div>

          <div class="field">
            <div class="field-row">
              <label for="password" class="field-label">Password</label>
            </div>
            <div class="input-wrap">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="field-input has-suffix"
              />
              <button
                type="button"
                class="toggle-pw"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a18.5 18.5 0 015.625-4.95M9.53 9.53A4.5 4.5 0 0012 6c3.18 0 5.425 2.035 6.7 4.95M1 1l22 22"
                  />
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
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                  opacity="0.25"
                />
                <path
                  fill="currentColor"
                  opacity="0.75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Authenticating...
            </span>
            <span v-else>Sign in to dashboard</span>
          </button>
        </form>

        <!-- Employee link -->
        <!-- <div class="alt-action">
          <span>Employee?</span>
          <a href="#" @click.prevent="router.push('/login')" class="alt-link">
            Use employee login
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div> -->

        <p class="form-footer">© 2026 Attendance App</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root layout ─────────────────────────────────── */
.login-root {
  display: grid;
  grid-template-columns: 40% 1fr;
  min-height: 100vh;
  font-family: var(--adm-font-body);
  background: var(--adm-bg);
  color: var(--adm-text);
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
  background: var(--adm-bg);
  background-image:
    radial-gradient(
      circle at 50% 0%,
      rgba(99, 102, 241, 0.12) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(255, 255, 255, 0.045) 1px,
      transparent 0
    );
  background-size:
    100% 100%,
    20px 20px;
  overflow: hidden;
  animation: panelReveal 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelReveal {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 2.5rem;
}

/* Logo */
.logo-mark {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
}

.logo-mark svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  margin-bottom: 3rem;
}

.brand-name {
  font-family: var(--adm-font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--adm-text);
  line-height: 1;
  text-transform: uppercase;
}

.brand-role {
  font-family: var(--adm-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--adm-accent);
  margin-top: 0.5rem;
}

/* Grid lines decoration */
.grid-lines {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 3rem 0;
}

.grid-line {
  display: block;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--adm-border) 30%,
    var(--adm-border) 70%,
    transparent
  );
}

/* Corner marks */
.brand-inner::before,
.brand-inner::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: var(--adm-accent);
  border-style: solid;
  opacity: 0.4;
}
.brand-inner::before {
  top: 2rem;
  right: 2rem;
  border-width: 2px 2px 0 0;
}
.brand-inner::after {
  bottom: 2rem;
  left: 2rem;
  border-width: 0 0 2px 2px;
}

/* Brand footer */
.brand-footer {
  margin-top: auto;
}

.brand-tagline {
  font-size: 0.875rem;
  color: var(--adm-muted);
  line-height: 1.6;
  max-width: 260px;
}

.accent-line {
  margin-top: 1.5rem;
  width: 40px;
  height: 3px;
  background: var(--adm-accent);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--adm-accent-glow);
}

/* Scanning line animation */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--adm-highlight),
    transparent
  );
  box-shadow: 0 0 8px var(--adm-highlight-glow);
  animation: scan 4s ease-in-out infinite;
}

@keyframes scan {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

/* ── Right form panel ───────────────────────────── */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: panelRevealRight 500ms 80ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelRevealRight {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-inner {
  width: 100%;
  max-width: 400px;
}

/* Form header */
.form-header {
  margin-bottom: 2rem;
}

.form-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  margin-bottom: 1.25rem;
  color: var(--adm-accent);
}

.form-icon svg {
  width: 22px;
  height: 22px;
}

.form-title {
  font-family: var(--adm-font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--adm-text);
  line-height: 1.2;
}

.form-sub {
  font-size: 0.9375rem;
  color: var(--adm-muted);
  margin-top: 0.375rem;
}

/* Error alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--adm-danger-muted);
  border: 1px solid rgba(244, 63, 94, 0.2);
  border-radius: 8px;
  color: #fda4af;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.alert-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 250ms ease;
}
.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--adm-muted);
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--adm-surface);
  border: 1px solid var(--adm-border);
  border-radius: 8px;
  color: var(--adm-text) !important;
  font-family: var(--adm-font-body);
  font-size: 0.9375rem;
  transition:
    border-color 200ms,
    box-shadow 200ms;
  box-sizing: border-box;
}

.field-input::placeholder {
  color: var(--adm-placeholder);
}

.field-input:focus {
  outline: none;
  border-color: var(--adm-accent);
  box-shadow: 0 0 0 3px var(--adm-accent-glow);
}

.field-input.is-error {
  border-color: rgba(244, 63, 94, 0.5);
  background: rgba(244, 63, 94, 0.04);
}

/* Autofill */
.field-input:-webkit-autofill,
.field-input:-webkit-autofill:hover,
.field-input:-webkit-autofill:focus,
.field-input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--adm-text) !important;
  -webkit-box-shadow: 0 0 0 1000px var(--adm-surface) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.field-err {
  font-size: 0.75rem;
  color: #fda4af;
}

/* Password toggle */
.input-wrap {
  position: relative;
}

.has-suffix {
  padding-right: 2.75rem;
}

.toggle-pw {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--adm-muted);
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 150ms;
  display: flex;
  align-items: center;
}

.toggle-pw:hover {
  color: var(--adm-text);
}
.toggle-pw svg {
  width: 18px;
  height: 18px;
}

/* Submit */
.submit-btn {
  width: 100%;
  padding: 0.8125rem 1rem;
  background: #10b981;
  color: #fff;
  font-family: var(--adm-font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 200ms,
    box-shadow 200ms,
    transform 100ms;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
  margin-top: 0.5rem;
  letter-spacing: 0.01em;
}

.submit-btn:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: var(--adm-border);
  color: var(--adm-muted);
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Alt action */
.alt-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--adm-muted);
}

.alt-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--adm-accent);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 150ms,
    gap 150ms;
}

.alt-link:hover {
  color: var(--adm-accent-hover);
  gap: 0.375rem;
}
.alt-link svg {
  width: 14px;
  height: 14px;
  transition: transform 150ms;
}
.alt-link:hover svg {
  transform: translateX(2px);
}

/* Footer */
.form-footer {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: var(--adm-muted);
  text-align: center;
  opacity: 0.6;
}

/* ── Mobile adjustments ─────────────────────────── */
@media (max-width: 768px) {
  .brand-panel {
    padding: 2.5rem 2rem;
    min-height: 180px;
  }

  .brand-tagline {
    display: none;
  }
  .accent-line {
    margin-top: 0.75rem;
  }
  .grid-lines {
    display: none;
  }

  .form-panel {
    animation-name: panelReveal;
    animation-delay: 0ms;
    padding: 2rem 1.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
}
</style>
