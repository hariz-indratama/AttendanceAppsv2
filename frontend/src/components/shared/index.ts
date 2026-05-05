// Shared components barrel export
export { default as AppBadge } from './AppBadge.vue'
export { default as AppCard } from './AppCard.vue'
export { default as ToastContainer } from './ToastContainer.vue'
export { default as ErrorBoundary } from './ErrorBoundary.vue'
export type { BadgeVariant, BadgeSize } from './AppBadge.vue'
export type { Toast } from '@/store/ui'

// Re-export store for convenience
export { useUiStore } from '@/store/ui'