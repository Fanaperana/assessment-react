import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFetch } from './useFetch'

afterEach(() => vi.unstubAllGlobals())

describe('useFetch', () => {
  it('returns fetched data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ value: 1 }) })),
    )
    const { result } = renderHook(() => useFetch<{ value: number }>('/one'))
    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }))
    expect(result.current.isLoading).toBe(false)
  })
  it('shows an error and retries', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ value: 2 }) })
    vi.stubGlobal('fetch', mock)
    const { result } = renderHook(() => useFetch<{ value: number }>('/one'))
    await waitFor(() => expect(result.current.error).toContain('500'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.data).toEqual({ value: 2 }))
    expect(mock).toHaveBeenCalledTimes(2)
  })
  it('aborts the previous request when the URL changes', () => {
    const signals: AbortSignal[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: { signal: AbortSignal }) => {
        signals.push(options.signal)
        return new Promise(() => {})
      }),
    )
    const { rerender, unmount } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: '/one' },
    })
    rerender({ url: '/two' })
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
    unmount()
    expect(signals[1].aborted).toBe(true)
  })
})
