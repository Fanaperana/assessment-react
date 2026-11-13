import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../hooks/useTheme'
import { ThemeProvider } from './ThemeContext'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('ThemeProvider', () => {
  it('restores a previous user choice from storage', () => {
    localStorage.setItem('shoplite-theme', JSON.stringify('dark'))
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    )

    function CurrentTheme() {
      return <span>{useTheme().theme}</span>
    }

    render(
      <ThemeProvider>
        <CurrentTheme />
      </ThemeProvider>,
    )
    expect(screen.getByText('dark')).toBeInTheDocument()
  })

  it('follows system changes until the user chooses a theme', () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    let matches = false
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        get matches() {
          return matches
        },
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          listeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          listeners.delete(listener),
      })),
    )

    function Controls() {
      const { theme, toggleTheme } = useTheme()
      return <button onClick={toggleTheme}>{theme}</button>
    }

    render(
      <ThemeProvider>
        <Controls />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
    expect(localStorage.getItem('shoplite-theme')).toBeNull()

    matches = true
    act(() => listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent)))
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
    expect(localStorage.getItem('shoplite-theme')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'dark' }))
    expect(JSON.parse(localStorage.getItem('shoplite-theme') ?? 'null')).toBe('light')
    matches = false
    act(() => listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent)))
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
  })
})
