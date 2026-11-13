import { useCallback, useLayoutEffect, useReducer, useRef } from 'react'
import { emptyHistory, historyReducer } from '@/features/history/historyReducer'
import type { HistoryAction, HistoryState } from '@/features/history/historyReducer'

export function useBoardStore() {
  const [history, dispatch] = useReducer(historyReducer, emptyHistory)
  const current = useRef(history)

  useLayoutEffect(() => {
    current.current = history
  }, [history])

  const send = useCallback((action: HistoryAction) => {
    current.current = historyReducer(current.current, action)
    dispatch(action)
  }, [])
  const getState = useCallback((): HistoryState => current.current, [])

  return { history, send, getState }
}
