<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/api/axios";
import { useWebAuthn } from "@/composables/useWebAuthn";
import ClockStatus from "@/components/employee/clock/ClockStatus.vue";
import LocationDisplay from "@/components/employee/clock/LocationDisplay.vue";
import ClockButton from "@/components/employee/clock/ClockButton.vue";
import BiometricPrompt from "@/components/employee/clock/BiometricPrompt.vue";
import AttendanceSummary from "@/components/employee/clock/AttendanceSummary.vue";
import ClockMessages from "@/components/employee/clock/ClockMessages.vue";

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

function getCurrentLocation() {
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
    <!-- Messages -->
    <ClockMessages
      :success-message="successMessage"
      :error="error || webAuthnError"
    />

    <!-- Clock Status -->
    <ClockStatus :current-time="currentTime" :current-date="currentDate" />

    <!-- Location Display -->
    <LocationDisplay
      :location="currentLocation"
      :is-loading="isGettingLocation"
      :error="locationError"
      @retry="getCurrentLocation"
    />

    <!-- Clock Action Button -->
    <ClockButton
      :isClockedIn="isClockedIn ?? false"
      :isLoading="isLoading"
      :clockedInTime="clockedInTime"
      :disabled="!currentLocation || isGettingLocation"
      @clock-in="handleClockIn"
      @clock-out="handleClockOut"
    />

    <!-- Biometric Verification Indicator -->
    <BiometricPrompt
      :is-verifying="isVerifying"
      :error="webAuthnError"
    />

    <!-- Attendance Summary -->
    <AttendanceSummary
      :attendance="todayAttendance"
      :clocked-in-time="clockedInTime"
    />
  </div>
</template>

<style>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  font-family: var(--font-body);
}
</style>