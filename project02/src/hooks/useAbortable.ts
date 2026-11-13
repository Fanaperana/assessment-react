import { useCallback, useEffect, useRef } from 'react'

export function useAbortable() {
  const controllers = useRef(new Set<AbortController>())
  const mounted = useRef(true)

  useEffect(() => {
    const pending = controllers.current
    mounted.current = true
    return () => {
      mounted.current = false
      pending.forEach((controller) => controller.abort())
      pending.clear()
    }
  }, [])

  return useCallback(async <T>(task: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    if (!mounted.current) throw new DOMException('Page closed', 'AbortError')
    const controller = new AbortController()
    controllers.current.add(controller)
    try {
      return await task(controller.signal)
    } finally {
      controllers.current.delete(controller)
    }
  }, [])
}
