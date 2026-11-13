import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './useTheme'
import type { Theme } from './useTheme'

function savedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem('flowboard:theme')
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState<Theme | null>(savedTheme)
  const [system, setSystem] = useState<Theme>(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  const theme = chosen ?? system

  useEffect(() => {
    if (chosen) return
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const onChange = (event: MediaQueryListEvent) => setSystem(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [chosen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setChosen(next)
    try {
      localStorage.setItem('flowboard:theme', next)
    } catch {
      // Keep the choice for this visit when storage is unavailable.
    }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
