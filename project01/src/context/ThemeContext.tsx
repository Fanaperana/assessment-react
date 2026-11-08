import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from '../hooks/useTheme'
import type { Theme } from '../hooks/useTheme'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('shoplite-theme', systemTheme())
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>
}
