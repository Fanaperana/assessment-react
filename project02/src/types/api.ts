// Types for the FlowBoard mock API. See API.md for every endpoint.
// You may add your own client-side types elsewhere, but do not change these:
// they describe what the mock server sends and accepts.

export type Priority = 'low' | 'medium' | 'high'

export interface Board {
  id: string
  title: string
  createdAt: string // ISO date
}

export interface BoardSummary extends Board {
  columnCount: number
  cardCount: number
}

export interface Column {
  id: string
  boardId: string
  title: string
  position: number // 0-based order inside the board
}

export interface Card {
  id: string
  columnId: string
  title: string
  description: string
  priority: Priority
  labels: string[]
  dueDate: string | null // "YYYY-MM-DD" or null
  position: number // 0-based order inside the column
  createdAt: string // ISO date
  updatedAt: string // ISO date
}

/** Response of GET /api/boards/:boardId */
export interface BoardDetail {
  board: Board
  columns: Column[] // sorted by position
  cards: Card[] // sorted by columnId, then position
}

/** Body of every error response (status 400, 404 or 500). */
export interface ApiError {
  message: string
}

export interface CreateCardInput {
  title: string
  description?: string
  priority?: Priority
  labels?: string[]
  dueDate?: string | null
}

/** Body of PATCH /api/cards/:cardId. To move a card, send columnId and/or position. */
export type UpdateCardInput = Partial<
  Pick<Card, 'title' | 'description' | 'priority' | 'labels' | 'dueDate' | 'columnId' | 'position'>
>
