<script setup lang="ts">
import { useRouter } from "vue-router";
import SettingsLinksList from "@/components/employee/settings/SettingsLinksList.vue";
import ActiveSessionsCard from "@/components/employee/settings/ActiveSessionsCard.vue";
import AppInfoCard from "@/components/employee/settings/AppInfoCard.vue";
import SettingsLogoutButton from "@/components/employee/settings/SettingsLogoutButton.vue";

const settingsLinks = [
  {
    name: "Notifications",
    path: "settings/notifications",
    desc: "Clock reminders, alerts, payroll",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    name: "Security",
    path: "settings/security",
    desc: "Biometric & location verification",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    name: "Display",
    path: "settings/display",
    desc: "Theme and appearance",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
];

const appVersion = "1.0.0";
const buildNumber = "2026.05.03";
const registeredDevices = ["Chrome · Windows", "Safari · iOS"];
const enrolledDevices = 2;
</script>

<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header" style="animation-delay: 0ms">
      <div class="page-header-eyebrow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>Settings</span>
      </div>
      <h1 class="page-title">Preferences</h1>
      <p class="page-subtitle">Customize how Attendance works for you</p>
    </div>

    <!-- Settings Links -->
    <SettingsLinksList :links="settingsLinks" style="animation-delay: 60ms" />

    <!-- Active Sessions -->
    <ActiveSessionsCard
      :devices="registeredDevices"
      :enrolled-devices="enrolledDevices"
      style="animation-delay: 280ms"
    />

    <!-- App Info Card -->
    <AppInfoCard :version="appVersion" :build-number="buildNumber" style="animation-delay: 320ms" />

    <!-- Sign Out -->
    <SettingsLogoutButton style="animation-delay: 360ms" />

    <div class="bottom-spacer" />
  </div>
</template>

<style>
/* All styles consume global CSS tokens from base.css */
.page {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-top: 0.5rem;
  font-family: var(--font-body);
  animation: fadeUp 400ms ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-header-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--accent);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.page-header-eyebrow svg {
  width: 0.875rem;
  height: 0.875rem;
}
.page-title {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Bottom spacer */
.bottom-spacer {
  height: 0.5rem;
}
</style>
