import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router'
import type { Priority } from '@/types/api'
import type { BoardState } from './boardReducer'

export function useBoardFilters(state: BoardState) {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const deferredQ = useDeferredValue(q)
  const selectedPriority = params.get('priority') ?? ''
  const priority: Priority | '' =
    selectedPriority === 'high' || selectedPriority === 'medium' || selectedPriority === 'low'
      ? selectedPriority
      : ''
  const label = params.get('label') ?? ''
  const labels = [...new Set(Object.values(state.cards).flatMap((card) => card.labels))].sort()

  function changeFilter(key: 'q' | 'priority' | 'label', value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: key === 'q' },
    )
  }

  return { q, deferredQ, priority, label, labels, changeFilter }
}
