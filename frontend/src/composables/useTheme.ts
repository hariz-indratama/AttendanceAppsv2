import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'app_theme'

function loadFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // ignore
  }
  return 'system'
}

function saveToStorage(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

function applyTheme(theme: Theme, resolved: ResolvedTheme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else {
    // system
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }
}

function resolveSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const theme = ref<Theme>(loadFromStorage())
  const resolvedTheme = ref<ResolvedTheme>(resolveSystemTheme())

  let mediaQuery: MediaQueryList | null = null

  function init(): void {
    applyTheme(theme.value, resolvedTheme.value)

    if (theme.value === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        resolvedTheme.value = e.matches ? 'dark' : 'light'
        applyTheme('system', resolvedTheme.value)
      })
    }
  }

  function setTheme(t: Theme): void {
    theme.value = t
    if (t === 'system') {
      resolvedTheme.value = resolveSystemTheme()
    } else {
      resolvedTheme.value = t
    }
    applyTheme(t, resolvedTheme.value)
    saveToStorage(t)

    // Re-attach media listener if switching to system
    if (t === 'system' && !mediaQuery) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        resolvedTheme.value = e.matches ? 'dark' : 'light'
        applyTheme('system', resolvedTheme.value)
      })
    }
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    init,
  }
}
