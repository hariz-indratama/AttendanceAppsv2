<script setup lang="ts">
type Tab = 'overview' | 'attendance' | 'payroll'

const props = defineProps<{
  activeTab: Tab
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: Tab]
}>()

const tabs: Tab[] = ['overview', 'attendance', 'payroll']

function selectTab(tab: Tab) {
  emit('update:activeTab', tab)
}
</script>

<template>
  <div class="tab-bar" style="animation-delay: 80ms">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="selectTab(tab)"
      class="tab-btn"
      :class="{ 'tab-btn--active': activeTab === tab }"
    >
      {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
    </button>
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tab-bar {
  display: flex;
  gap: 0.25rem;
  animation: fadeUp 300ms ease-out both;
}

.tab-btn {
  flex: 1;
  padding: 0.625rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
}

.tab-btn--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
</style>
