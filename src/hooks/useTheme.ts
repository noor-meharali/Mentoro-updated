import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'mentoro_theme'

const getInitialTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }
  return 'dark'
}

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }
}
