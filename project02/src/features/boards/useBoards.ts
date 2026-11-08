import { createContext, useContext } from 'react'
import type { Board, BoardSummary } from '@/types/api'

interface BoardsValue {
  boards: BoardSummary[]
  loading: boolean
  error: string | null
  reload: () => void
  updateLocal: (updater: (boards: BoardSummary[]) => BoardSummary[]) => void
  createBoard: (title: string) => Promise<Board>
  renameBoard: (board: BoardSummary, title: string) => Promise<boolean>
  deleteBoard: (board: BoardSummary) => Promise<void>
}

export const BoardsContext = createContext<BoardsValue | null>(null)

export function useBoards() {
  const value = useContext(BoardsContext)
  if (!value) throw new Error('BoardsProvider is missing.')
  return value
}
