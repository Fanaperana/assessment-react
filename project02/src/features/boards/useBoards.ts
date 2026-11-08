import { createContext, useContext } from 'react'
import type { BoardSummary } from '@/types/api'

interface BoardsValue {
  boards: BoardSummary[]
  loading: boolean
  error: string | null
  reload: () => void
  updateLocal: (updater: (boards: BoardSummary[]) => BoardSummary[]) => void
}

export const BoardsContext = createContext<BoardsValue | null>(null)

export function useBoards() {
  const value = useContext(BoardsContext)
  if (!value) throw new Error('BoardsProvider is missing.')
  return value
}
