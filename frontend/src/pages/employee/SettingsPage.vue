<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const authStore = useAuthStore();

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

function navigateTo(path: string) {
  router.push(path);
}

const appVersion = "1.0.0";
const buildNumber = "2026.05.03";
const registeredDevices = ["Chrome · Windows", "Safari · iOS"];
const enrolledDevices = 2;

const isLoggingOut = ref(false);

async function handleLogout() {
  isLoggingOut.value = true;
  await authStore.logout();
  localStorage.removeItem("user_role");
  router.push("/login");
}
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
    <div class="settings-list" style="animation-delay: 60ms">
      <button
        v-for="(link, li) in settingsLinks"
        :key="link.path"
        class="settings-link"
        :style="{ animationDelay: `${100 + li * 40}ms` }"
        @click="navigateTo(link.path)"
      >
        <div class="link-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              :d="link.icon"
            />
          </svg>
        </div>
        <div class="link-info">
          <p class="link-name">{{ link.name }}</p>
          <p class="link-desc">{{ link.desc }}</p>
        </div>
        <svg
          class="link-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    <!-- Active Sessions -->
    <div class="card info-card" style="animation-delay: 280ms">
      <div class="card-header">
        <div class="card-header-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <div class="card-header-text">
          <p class="card-header-title">Active Sessions</p>
          <p class="card-header-sub">
            {{ enrolledDevices }} devices registered
          </p>
        </div>
        <div class="online-badge">
          <span class="online-dot" />
          <span>Online</span>
        </div>
      </div>
      <div class="session-list">
        <div
          v-for="(device, di) in registeredDevices"
          :key="di"
          class="session-item"
          :class="{ 'session-item--last': di === 0 }"
        >
          <div class="session-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="session-info">
            <p class="session-device">{{ device }}</p>
            <p class="session-status">
              <span v-if="di === 0" class="status-current"
                >Current session · Active now</span
              >
              <span v-else class="status-other">Active</span>
            </p>
          </div>
          <div v-if="di === 0" class="current-badge">Active</div>
        </div>
      </div>
    </div>

    <!-- App Info Card -->
    <div class="card info-card" style="animation-delay: 320ms">
      <div class="card-header">
        <div class="card-header-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="card-header-text">
          <p class="card-header-title">Attendance</p>
          <p class="card-header-sub">Employee Portal v{{ appVersion }}</p>
        </div>
        <span class="version-tag">Build {{ buildNumber }}</span>
      </div>
      <div class="app-info-links">
        <button class="info-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Privacy Policy</span>
          <svg
            class="info-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button class="info-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Help & Support</span>
          <svg
            class="info-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button class="info-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Terms of Service</span>
          <svg
            class="info-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Sign Out -->
    <div class="danger-zone" style="animation-delay: 360ms">
      <button @click="handleLogout" :disabled="isLoggingOut" class="logout-btn">
        <svg
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
        <span>{{
          isLoggingOut ? "Signing out…" : "Sign out of this device"
        }}</span>
      </button>
    </div>

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

/* Settings link list */
.settings-list {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.settings-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9375rem 1rem;
  border-bottom: 1px solid var(--border);
  border-top: none;
  border-left: none;
  border-right: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background 150ms;
  animation: fadeUp 200ms ease-out both;
  width: 100%;
}
.settings-link:last-child {
  border-bottom: none;
}
.settings-link:hover {
  background: rgba(255, 255, 255, 0.025);
}
.settings-link:hover .link-chevron {
  transform: translateX(3px);
}
.link-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--accent-muted);
  border: 1px solid var(--accent-border);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.link-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--accent);
}
.link-info {
  flex: 1;
  min-width: 0;
}
.link-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}
.link-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.link-chevron {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
  flex-shrink: 0;
  transition:
    transform 200ms ease,
    color 150ms;
}

/* Info Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.125rem 1rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025) inset,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 16px 32px -4px rgba(0, 0, 0, 0.4);
  animation: fadeUp 300ms ease-out both;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}
.card-header-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-header-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}
.card-header-text {
  flex: 1;
  min-width: 0;
}
.card-header-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}
.card-header-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Online Badge */
.online-badge {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  background: var(--success-muted);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--success);
  white-space: nowrap;
}
.online-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 4px var(--success);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Session List */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6875rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: border-color 150ms;
}
.session-item--last {
  border-color: var(--accent-border);
  background: rgba(232, 146, 12, 0.04);
}
.session-icon {
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.session-icon svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}
.session-info {
  flex: 1;
  min-width: 0;
}
.session-device {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}
.session-status {
  font-size: 0.75rem;
  margin-top: 0.0625rem;
}
.status-current {
  color: var(--accent);
}
.status-other {
  color: var(--text-muted);
}
.current-badge {
  padding: 0.1875rem 0.5rem;
  background: var(--accent-muted);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
}

/* Version Tag */
.version-tag {
  padding: 0.1875rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  white-space: nowrap;
}

/* App Info Links */
.app-info-links {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.info-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.625rem;
  border-radius: 0.625rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    background 150ms,
    color 150ms;
}
.info-link svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
.info-link span {
  flex: 1;
}
.info-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}
.info-link:hover .info-chevron {
  color: var(--text-secondary);
  transform: translateX(3px);
  transition: transform 200ms ease;
}
.info-chevron {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-muted);
  flex-shrink: 0;
  transition:
    transform 200ms ease,
    color 150ms;
}

/* Danger Zone */
.danger-zone {
  margin-top: 0.25rem;
  display: flex;
  justify-content: center;
}
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 0.875rem;
  color: var(--danger);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms,
    transform 100ms;
}
.logout-btn svg {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform 200ms ease;
}
.logout-btn:hover {
  background: var(--danger-muted);
  border-color: rgba(248, 113, 113, 0.4);
}
.logout-btn:hover svg {
  transform: translateX(-3px);
}
.logout-btn:active {
  transform: scale(0.97);
}
.logout-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* Bottom spacer */
.bottom-spacer {
  height: 0.5rem;
}
</style>
