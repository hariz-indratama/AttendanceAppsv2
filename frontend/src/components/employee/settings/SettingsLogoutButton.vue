<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLoggingOut = ref(false);

async function handleLogout() {
  isLoggingOut.value = true;
  await authStore.logout();
  localStorage.removeItem("user_role");
  router.push("/login");
}
</script>

<template>
  <div class="danger-zone">
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
        isLoggingOut ? "Signing out..." : "Sign out of this device"
      }}</span>
    </button>
  </div>
</template>

<style scoped>
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
</style>
