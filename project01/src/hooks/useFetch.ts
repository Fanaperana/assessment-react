import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useFetch<T>(url: string | null) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, isLoading: Boolean(url) })

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    // Hide old results while a different URL is loading.
    fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        return response.json() as Promise<T>
      })
      .then(data => {
        if (!controller.signal.aborted) setState({ data, error: null, isLoading: false })
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ data: null, error: error instanceof Error ? error.message : 'Could not load data', isLoading: false })
      })
    return () => controller.abort()
  }, [url, attempt])

  const retry = () => {
    setState({ data: null, error: null, isLoading: true })
    setAttempt(current => current + 1)
  }

  // A different URL must never display data or errors from the previous URL.
  const [currentUrl, setCurrentUrl] = useState(url)
  if (currentUrl !== url) {
    setCurrentUrl(url)
    setState({ data: null, error: null, isLoading: Boolean(url) })
    return { data: null, error: null, isLoading: Boolean(url), retry }
  }
  return { ...state, retry }
}
