import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from '../hooks/useTheme'
import type { Theme } from '../hooks/useTheme'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storage = useLocalStorage<Theme | null>('shoplite-theme', null)
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(() => {
    const saved = storage.read()
    return saved === 'dark' || saved === 'light' ? saved : null
  })
  const [preferredTheme, setPreferredTheme] = useState<Theme>(systemTheme)
  const theme = chosenTheme ?? preferredTheme

  useEffect(() => {
    if (chosenTheme) return
    const preference = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!preference) return
    const followSystem = (event: MediaQueryListEvent) =>
      setPreferredTheme(event.matches ? 'dark' : 'light')
    preference.addEventListener('change', followSystem)
    return () => preference.removeEventListener('change', followSystem)
  }, [chosenTheme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setChosenTheme(next)
    storage.write(next)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
