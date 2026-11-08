import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/api/client'
import { useAbortable } from '@/hooks/useAbortable'
import type { BoardSummary } from '@/types/api'
import { BoardsContext } from './useBoards'

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const run = useAbortable()
  const reload = useCallback(() => setVersion((value) => value + 1), [])
  const updateLocal = useCallback(
    (updater: (boards: BoardSummary[]) => BoardSummary[]) => setBoards(updater),
    [],
  )

  async function createBoard(title: string) {
    const board = await run((signal) => api.createBoard(title, signal))
    reload()
    return board
  }

  async function renameBoard(board: BoardSummary, title: string) {
    updateLocal((items) => items.map((item) => (item.id === board.id ? { ...item, title } : item)))
    try {
      await run((signal) => api.updateBoard(board.id, title, signal))
      reload()
      return true
    } catch (reason) {
      updateLocal((items) => items.map((item) => (item.id === board.id ? board : item)))
      toast.error('Could not rename board', {
        description: reason instanceof Error ? reason.message : undefined,
        action: { label: 'Retry', onClick: () => void renameBoard(board, title) },
      })
      return false
    }
  }

  async function deleteBoard(board: BoardSummary) {
    updateLocal((items) => items.filter((item) => item.id !== board.id))
    try {
      await run((signal) => api.deleteBoard(board.id, signal))
      reload()
    } catch (reason) {
      updateLocal((items) =>
        items.some((item) => item.id === board.id) ? items : [...items, board],
      )
      toast.error('Could not delete board', {
        description: reason instanceof Error ? reason.message : undefined,
        action: { label: 'Retry', onClick: () => void deleteBoard(board) },
      })
    }
  }

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
    <BoardsContext.Provider
      value={{ boards, loading, error, reload, updateLocal, createBoard, renameBoard, deleteBoard }}
    >
      {children}
    </BoardsContext.Provider>
  )
}
