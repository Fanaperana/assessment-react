import { useCallback } from 'react'

export function useLocalStorage<T>(key: string, fallback: T) {
  const read = useCallback((): T => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? fallback : (JSON.parse(saved) as T)
    } catch {
      return fallback
    }
  }, [key, fallback])

  const write = useCallback(
    (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // The app remains usable when storage is disabled or full.
      }
    },
    [key],
  )

  return { read, write }
}
