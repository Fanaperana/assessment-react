import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

afterEach(() => vi.useRealTimers())
describe('useDebounce', () => {
  it('waits before publishing a changed value', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(399))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })
  it('cancels the previous timer on a later change', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), { initialProps: { value: 'a' } })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('c')
  })
})
