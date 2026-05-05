<script setup lang="ts">
import { useRouter } from "vue-router";

interface SettingsLink {
  name: string;
  path: string;
  desc: string;
  icon: string;
}

defineProps<{
  links: SettingsLink[];
}>();

const router = useRouter();

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="settings-list">
    <button
      v-for="(link, li) in links"
      :key="link.path"
      class="settings-link"
      :style="{ animationDelay: `${li * 40}ms` }"
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
</template>

<style scoped>
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
</style>
