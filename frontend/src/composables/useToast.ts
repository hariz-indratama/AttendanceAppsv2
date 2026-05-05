import { useUiStore } from '@/store/ui'
import type { Toast } from '@/store/ui'

export function useToast() {
  const uiStore = useUiStore()

  function toast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    uiStore.showToast(message, type, duration)
  }

  function success(message: string, duration = 3000) {
    toast(message, 'success', duration)
  }

  function error(message: string, duration = 5000) {
    toast(message, 'error', duration)
  }

  function warning(message: string, duration = 4000) {
    toast(message, 'warning', duration)
  }

  function info(message: string, duration = 3000) {
    toast(message, 'info', duration)
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
  }
}