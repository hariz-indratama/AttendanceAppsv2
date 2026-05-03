import { ref, reactive } from 'vue'

export type NotificationPermission = 'default' | 'granted' | 'denied'

export interface NotificationOptions {
  clockReminder: boolean
  shiftUpdates: boolean
  payrollAlerts: boolean
  adminMessages: boolean
}

interface StoredNotificationPrefs extends NotificationOptions {
  shiftTime: string
}

const STORAGE_KEY = 'notification_prefs'

function loadStored(): StoredNotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {
    clockReminder: false,
    shiftUpdates: false,
    payrollAlerts: false,
    adminMessages: false,
    shiftTime: '08:00',
  }
}

function saveStored(prefs: StoredNotificationPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

let clockReminderTimer: ReturnType<typeof setTimeout> | null = null

export function useNotifications() {
  const isSupported = 'Notification' in window
  const permission = ref<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : 'default',
  )

  const options = reactive<NotificationOptions>({
    clockReminder: false,
    shiftUpdates: false,
    payrollAlerts: false,
    adminMessages: false,
  })

  let storedShiftTime = '08:00'

  function isPermissionGranted(): boolean {
    return permission.value === 'granted'
  }

  async function requestPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (!isSupported) return 'unsupported'
    if (permission.value === 'granted') return 'granted'

    try {
      const result = await Notification.requestPermission()
      permission.value = result as NotificationPermission
      return permission.value as 'granted' | 'denied'
    } catch {
      return 'denied'
    }
  }

  async function toggle(key: keyof NotificationOptions): Promise<void> {
    if (permission.value === 'denied') return

    if (permission.value === 'default') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }

    options[key] = !options[key]
    saveStored({ ...options, shiftTime: storedShiftTime })

    if (key === 'clockReminder') {
      if (options.clockReminder) {
        scheduleClockReminder(storedShiftTime)
      } else {
        cancelClockReminder()
      }
    }
  }

  function scheduleClockReminder(shiftTime: string): void {
    cancelClockReminder()

    const parts = shiftTime.split(':').map(Number)
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const now = new Date()
    const target = new Date(now)
    target.setHours(Number(hours), Number(minutes), 0, 0)

    // Fire 50 minutes before shift
    const fireAt = new Date(target.getTime() - 50 * 60 * 1000)
    let delay = fireAt.getTime() - now.getTime()

    // If time has passed today, schedule for tomorrow
    if (delay < 0) {
      const tomorrow = new Date(target)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowFire = new Date(tomorrow.getTime() - 50 * 60 * 1000)
      delay = tomorrowFire.getTime() - Date.now()
    }

    if (delay > 0) {
      clockReminderTimer = setTimeout(() => {
        if (isPermissionGranted()) {
          new Notification('⏰ Clock in soon!', {
            body: 'Your shift starts in 10 minutes',
            icon: '/favicon.ico',
          })
        }
        // Reschedule for tomorrow midnight
        scheduleAtMidnight(shiftTime)
      }, delay as number)
    }
  }

  function scheduleAtMidnight(shiftTime: string): void {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)

    const delay = midnight.getTime() - now.getTime()
    clockReminderTimer = setTimeout(() => {
      scheduleClockReminder(shiftTime)
    }, delay)
  }

  function cancelClockReminder(): void {
    if (clockReminderTimer !== null) {
      clearTimeout(clockReminderTimer)
      clockReminderTimer = null
    }
  }

  function loadFromStorage(): void {
    const stored = loadStored()
    options.clockReminder = stored.clockReminder
    options.shiftUpdates = stored.shiftUpdates
    options.payrollAlerts = stored.payrollAlerts
    options.adminMessages = stored.adminMessages
    storedShiftTime = stored.shiftTime

    if (stored.clockReminder && stored.shiftTime) {
      scheduleClockReminder(stored.shiftTime)
    }
  }

  function saveToStorage(): void {
    saveStored({
      ...options,
      shiftTime: storedShiftTime,
    })
  }

  function setShiftTime(time: string): void {
    storedShiftTime = time
    saveToStorage()
    if (options.clockReminder) {
      scheduleClockReminder(time)
    }
  }

  return {
    permission,
    isSupported,
    options,
    isPermissionGranted,
    requestPermission,
    toggle,
    scheduleClockReminder,
    cancelClockReminder,
    loadFromStorage,
    saveToStorage,
    setShiftTime,
  }
}
