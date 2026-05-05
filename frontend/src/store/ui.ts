import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const activeModal = ref<string | null>(null)
  const toasts = ref<Toast[]>([])
  const globalLoading = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function openModal(modalId: string) {
    activeModal.value = modalId
  }

  function closeModal() {
    activeModal.value = null
  }

  function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  return {
    sidebarCollapsed,
    activeModal,
    toasts,
    globalLoading,
    toggleSidebar,
    openModal,
    closeModal,
    showToast,
    dismissToast,
    setGlobalLoading,
  }
})
