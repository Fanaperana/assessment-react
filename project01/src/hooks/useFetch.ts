import { useEffect, useState } from 'react'

interface FetchState<T> {
  url: string | null
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useFetch<T>(url: string | null) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<FetchState<T>>({
    url,
    data: null,
    error: null,
    isLoading: Boolean(url),
  })

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        return response.json() as Promise<T>
      })
      .then((data) => {
        if (!controller.signal.aborted) setState({ url, data, error: null, isLoading: false })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            url,
            data: null,
            error: error instanceof Error ? error.message : 'Could not load data',
            isLoading: false,
          })
      })
    return () => controller.abort()
  }, [url, attempt])

  const retry = () => {
    setState({ url, data: null, error: null, isLoading: true })
    setAttempt((current) => current + 1)
  }

  // A different URL must never display data or errors from the previous URL.
  return state.url === url
    ? { data: state.data, error: state.error, isLoading: state.isLoading, retry }
    : { data: null, error: null, isLoading: Boolean(url), retry }
}
