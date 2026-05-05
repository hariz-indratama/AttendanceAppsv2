<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/api/axios";
import { useWebAuthn } from "@/composables/useWebAuthn";

const router = useRouter();
const authStore = useAuthStore();
const { startVerification, isVerifying, error: webAuthnError } = useWebAuthn();

const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const currentLocation = ref<{ lat: number; lng: number } | null>(null);
const locationError = ref<string | null>(null);
const isGettingLocation = ref(false);

const todayAttendance = ref<{
  id: number;
  clock_in: string;
  clock_out: string | null;
  status: string;
  total_hours: number | null;
} | null>(null);

const isClockedIn = computed(
  () => todayAttendance.value && !todayAttendance.value.clock_out,
);
const clockedInTime = computed(() => {
  if (!todayAttendance.value?.clock_in) return null;
  return new Date(todayAttendance.value.clock_in).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const currentTime = ref(
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
);

const currentDate = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
);

let timeInterval: ReturnType<typeof setInterval>;
onMounted(() => {
  fetchTodayAttendance();
  getCurrentLocation();
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, 1000);
});

onUnmounted(() => clearInterval(timeInterval));

async function fetchTodayAttendance() {
  try {
    const response = await apiClient.get("/attendance/today");
    todayAttendance.value = response.data.data;
  } catch {
    todayAttendance.value = null;
  }
}

async function getCurrentLocation() {
  isGettingLocation.value = true;
  locationError.value = null;

  if (!navigator.geolocation) {
    locationError.value = "Geolocation not supported";
    isGettingLocation.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      isGettingLocation.value = false;
    },
    (err) => {
      locationError.value = `Unable to get location: ${err.message}`;
      isGettingLocation.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

async function handleClockIn() {
  if (!currentLocation.value) {
    error.value = "Enable location services to clock in";
    return;
  }

  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const biometricVerified = await verifyBiometric();

    const response = await apiClient.post("/attendance/clock-in", {
      latitude: currentLocation.value.lat,
      longitude: currentLocation.value.lng,
      device_id: await getDeviceId(),
      biometric_verified: biometricVerified,
    });

    todayAttendance.value = response.data.data.attendance;
    successMessage.value = response.data.message;
    if (navigator.vibrate) navigator.vibrate(12);

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err: unknown) {
    const e = err as {
      response?: {
        data?: {
          message?: string;
          error_code?: string;
          distance?: number;
          allowed_radius?: number;
        };
      };
    };
    if (e.response?.data?.error_code === "GEOFENCE_VIOLATION") {
      error.value = `You are ${e.response.data.distance}m away from office (allowed: ${e.response.data.allowed_radius}m)`;
    } else {
      error.value = e.response?.data?.message || "Failed to clock in";
    }
  } finally {
    isLoading.value = false;
  }
}

async function handleClockOut() {
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const response = await apiClient.post("/attendance/clock-out", {
      latitude: currentLocation.value?.lat || null,
      longitude: currentLocation.value?.lng || null,
    });

    todayAttendance.value = response.data.data.attendance;
    successMessage.value = `Clocked out! Total: ${response.data.data.total_hours}`;
    if (navigator.vibrate) navigator.vibrate(12);

    setTimeout(() => {
      successMessage.value = null;
    }, 5000);
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    error.value = e.response?.data?.message || "Failed to clock out";
  } finally {
    isLoading.value = false;
  }
}

async function verifyBiometric(): Promise<boolean> {
  try {
    const result = await startVerification(authStore.user?.email || "");
    return result.success;
  } catch {
    return false;
  }
}

async function getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}
</script>

<template>
  <div class="page">
    <!-- Success Alert -->
    <transition name="alert-slide">
      <div v-if="successMessage" class="alert alert--success" role="alert">
        <svg
          class="alert-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </transition>

    <!-- Error Alert -->
    <transition name="alert-slide">
      <div
        v-if="error || webAuthnError"
        class="alert alert--error"
        role="alert"
      >
        <svg
          class="alert-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ error || webAuthnError }}</span>
      </div>
    </transition>

    <!-- Clock Display Card -->
    <div class="card card--clock">
      <div class="clock-time">{{ currentTime }}</div>
      <div class="clock-date">{{ currentDate }}</div>
    </div>

    <!-- Location Card -->
    <div class="card card--location">
      <div class="loc-row">
        <div
          class="loc-icon-wrap"
          :class="
            currentLocation ? 'loc-icon-wrap--ok' : 'loc-icon-wrap--loading'
          "
        >
          <svg
            v-if="currentLocation"
            class="loc-icon loc-icon--ok"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else-if="isGettingLocation"
            class="loc-icon loc-icon--spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.3"
            />
            <path
              fill="currentColor"
              opacity="0.8"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <svg
            v-else
            class="loc-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div class="loc-info">
          <p class="loc-title">Location</p>
          <p v-if="currentLocation" class="loc-coords">
            {{ currentLocation.lat.toFixed(5) }},
            {{ currentLocation.lng.toFixed(5) }}
          </p>
          <p v-else-if="locationError" class="loc-status loc-status--err">
            {{ locationError }}
          </p>
          <p v-else-if="isGettingLocation" class="loc-status">
            Getting location…
          </p>
          <p v-else class="loc-status">Location unavailable</p>
        </div>
        <button
          v-if="!currentLocation && !locationError && !isGettingLocation"
          @click="getCurrentLocation"
          class="retry-btn"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Clock Action Card -->
    <div class="card card--action">
      <!-- Clocked In State -->
      <div v-if="isClockedIn" class="action-state">
        <div class="action-icon-wrap action-icon-wrap--in">
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 class="action-title">Clocked In</h2>
        <p class="action-sub">Since {{ clockedInTime }}</p>
        <button
          @click="handleClockOut"
          :disabled="isLoading"
          class="btn btn--danger"
        >
          <span v-if="isLoading" class="btn-content">
            <svg class="spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="2.5"
                opacity="0.3"
              />
              <path
                fill="currentColor"
                opacity="0.9"
                d="M12 3a9 9 0 019 9v0a9 9 0 01-9 9 9 9 0 01-9-9v0a9 9 0 019-9z"
              />
            </svg>
            Processing…
          </span>
          <span v-else class="btn-content">
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Clock Out
          </span>
        </button>
      </div>

      <!-- Not Clocked In State -->
      <div v-else class="action-state">
        <div class="action-icon-wrap action-icon-wrap--out">
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="action-title">Ready to Clock In?</h2>
        <p class="action-sub">Make sure you're at the office</p>
        <button
          @click="handleClockIn"
          :disabled="isLoading || !currentLocation || isGettingLocation"
          class="btn btn--primary"
        >
          <span v-if="isLoading" class="btn-content">
            <svg class="spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="2.5"
                opacity="0.3"
              />
              <path
                fill="currentColor"
                opacity="0.9"
                d="M12 3a9 9 0 019 9v0a9 9 0 01-9 9 9 9 0 01-9-9v0a9 9 0 019-9z"
              />
            </svg>
            Verifying…
          </span>
          <span v-else class="btn-content">
            <svg
              class="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Clock In
          </span>
        </button>
        <p v-if="!currentLocation" class="action-hint">
          Enable location to clock in
        </p>
      </div>
    </div>

    <!-- Today's Summary -->
    <div v-if="todayAttendance" class="card card--summary">
      <h3 class="summary-title">Today's Summary</h3>
      <div class="summary-grid">
        <div class="summary-stat">
          <p class="stat-label">Clock In</p>
          <p class="stat-value">{{ clockedInTime || "--:--" }}</p>
        </div>
        <div class="summary-stat">
          <p class="stat-label">Hours</p>
          <p class="stat-value">
            {{ todayAttendance.total_hours?.toFixed(1) || "0.0"
            }}<span class="stat-unit">h</span>
          </p>
        </div>
        <div class="summary-stat">
          <p class="stat-label">Status</p>
          <p
            class="stat-value stat-value--badge"
            :class="`stat-value--${todayAttendance.status}`"
          >
            {{ todayAttendance.status }}
          </p>
        </div>
        <div class="summary-stat">
          <p class="stat-label">Clock Out</p>
          <p class="stat-value">
            {{
              todayAttendance.clock_out
                ? new Date(todayAttendance.clock_out).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" },
                  )
                : "--:--"
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* All styles consume global CSS tokens from base.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  font-family: var(--font-body);
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Card Base ─────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025) inset,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 32px -4px rgba(0, 0, 0, 0.4);
}

/* ─── Alerts ─────────────────────────────────────────────── */
.alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  animation: fadeIn 200ms ease-out;
}

.alert--success {
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: var(--success);
}

.alert--error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: var(--danger);
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.alert-slide-enter-active,
.alert-slide-leave-active {
  transition:
    opacity 200ms,
    transform 200ms;
}
.alert-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ─── Clock Card ─────────────────────────────────────────── */
.card--clock {
  text-align: center;
  padding: 2rem 1.5rem;
  animation-delay: 60ms;
}

.clock-time {
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  text-shadow: 0 0 2rem var(--accent-glow);
  animation: clockTick 1s ease-out;
}

@keyframes clockTick {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

.clock-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
}

/* ─── Location Card ──────────────────────────────────────── */
.card--location {
  padding: 1.25rem;
  animation-delay: 120ms;
}

.loc-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.loc-icon-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg);
  border: 1px solid var(--border);
}

.loc-icon-wrap--ok {
  background: var(--success-muted);
  border-color: rgba(52, 211, 153, 0.3);
}

.loc-icon-wrap--loading {
  background: var(--bg);
}

.loc-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-muted);
}

.loc-icon--ok {
  color: var(--success);
}

.loc-icon--spin {
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

.loc-info {
  flex: 1;
  min-width: 0;
}

.loc-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.125rem;
}

.loc-coords {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--success);
  letter-spacing: 0.02em;
}

.loc-status {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.loc-status--err {
  color: var(--danger);
}

.retry-btn {
  padding: 0.375rem 0.875rem;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms;
  white-space: nowrap;
}

.retry-btn:hover {
  background: var(--accent-muted);
}

/* ─── Action Card ─────────────────────────────────────────── */
.card--action {
  padding: 1.75rem 1.5rem;
  text-align: center;
  animation-delay: 180ms;
}

.action-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-icon-wrap {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  animation: iconPop 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes iconPop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.action-icon-wrap--in {
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.action-icon-wrap--out {
  background: var(--accent-muted);
  border: 1px solid rgba(232, 146, 12, 0.3);
}

.action-icon {
  width: 2rem;
  height: 2rem;
}

.action-icon-wrap--in .action-icon {
  color: var(--success);
}
.action-icon-wrap--out .action-icon {
  color: var(--accent);
}

.action-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.action-sub {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.action-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* ─── Buttons ───────────────────────────────────────────── */
.btn {
  width: 100%;
  padding: 0.9375rem 1.25rem;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    transform 150ms,
    box-shadow 150ms,
    background 150ms;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 60%
  );
  transform: translateX(-100%);
  transition: transform 400ms ease;
}

.btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.btn--primary {
  background: linear-gradient(135deg, #e8920c 0%, #f59e0b 100%);
  color: #0a0f1a;
  box-shadow:
    0 0 0 1px rgba(232, 146, 12, 0.3) inset,
    0 4px 1.5rem rgba(232, 146, 12, 0.25);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(232, 146, 12, 0.4) inset,
    0 8px 2rem rgba(232, 146, 12, 0.35);
}

.btn--primary:active:not(:disabled) {
  transform: scale(0.97);
}

.btn--danger {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  color: white;
  box-shadow:
    0 0 0 1px rgba(248, 113, 113, 0.3) inset,
    0 4px 1.5rem rgba(248, 113, 113, 0.25);
}

.btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(248, 113, 113, 0.4) inset,
    0 8px 2rem rgba(248, 113, 113, 0.35);
}

.btn--danger:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.spin {
  width: 1.125rem;
  height: 1.125rem;
  animation: spin 700ms linear infinite;
}

/* ─── Summary Card ───────────────────────────────────────── */
.card--summary {
  padding: 1.25rem;
  animation-delay: 240ms;
}

.summary-title {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.summary-stat {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-muted);
}

.stat-value--present {
  color: var(--success);
}
.stat-value--late {
  color: var(--warning);
}
.stat-value--absent {
  color: var(--danger);
}

.stat-value--badge {
  font-size: 0.9375rem;
  text-transform: capitalize;
}
</style>
