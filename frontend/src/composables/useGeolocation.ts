import { ref } from 'vue'

export type GeoStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'unavailable'

const STORAGE_KEY = 'geolocation_enabled'
const TIMEOUT_MS = 60_000

function loadEnabledFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveEnabledToStorage(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // ignore
  }
}

export function useGeolocation() {
  const isSupported = 'geolocation' in navigator
  const status = ref<GeoStatus>('idle')
  const enabled = ref(false)
  const errorMessage = ref<string | null>(null)

  function loadFromStorage(): void {
    enabled.value = loadEnabledFromStorage()
  }

  async function check(): Promise<boolean> {
    if (!isSupported) {
      status.value = 'unavailable'
      errorMessage.value = 'Location is not supported by this browser'
      return false
    }

    status.value = 'checking'
    errorMessage.value = null

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          status.value = 'granted'
          resolve(true)
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            status.value = 'denied'
            errorMessage.value = 'Location permission denied — enable in browser settings'
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            status.value = 'unavailable'
            errorMessage.value = 'Location unavailable — check your device settings'
          } else {
            status.value = 'idle'
            errorMessage.value = 'Could not determine location'
          }
          resolve(false)
        },
        {
          enableHighAccuracy: true,
          timeout: TIMEOUT_MS,
          maximumAge: 0,
        },
      )
    })
  }

  async function enable(): Promise<void> {
    const success = await check()
    if (success) {
      enabled.value = true
      saveEnabledToStorage(true)
    } else {
      enabled.value = false
      saveEnabledToStorage(false)
    }
  }

  function disable(): void {
    enabled.value = false
    status.value = 'idle'
    errorMessage.value = null
    saveEnabledToStorage(false)
  }

  return {
    isSupported,
    status,
    enabled,
    errorMessage,
    check,
    enable,
    disable,
    loadFromStorage,
  }
}
