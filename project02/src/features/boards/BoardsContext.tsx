import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/api/client'
import type { BoardSummary } from '@/types/api'
import { BoardsContext } from './useBoards'

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])
  const updateLocal = useCallback(
    (updater: (boards: BoardSummary[]) => BoardSummary[]) => setBoards(updater),
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    api
      .listBoards(controller.signal)
      .then((data) => {
        setBoards(data)
        setError(null)
        setLoading(false)
      })
      .catch((reason) => {
        if (controller.signal.aborted) return
        setError(reason instanceof Error ? reason.message : 'Could not load boards.')
        setLoading(false)
      })
    return () => controller.abort()
  }, [version])

  return (
    <BoardsContext.Provider value={{ boards, loading, error, reload, updateLocal }}>
      {children}
    </BoardsContext.Provider>
  )
}
