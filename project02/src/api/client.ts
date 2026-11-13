import type {
  Board,
  BoardDetail,
  BoardSummary,
  Card,
  Column,
  CreateCardInput,
  UpdateCardInput,
} from '@/types/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(response.status, body.message ?? `Request failed (${response.status}).`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const json = (body: unknown) => JSON.stringify(body)

export const api = {
  listBoards: (signal?: AbortSignal) => request<BoardSummary[]>('/boards', { signal }),
  createBoard: (title: string, signal?: AbortSignal) =>
    request<Board>('/boards', { method: 'POST', body: json({ title }), signal }),
  getBoard: (id: string, signal?: AbortSignal) => request<BoardDetail>(`/boards/${id}`, { signal }),
  updateBoard: (id: string, title: string, signal?: AbortSignal) =>
    request<Board>(`/boards/${id}`, { method: 'PATCH', body: json({ title }), signal }),
  deleteBoard: (id: string, signal?: AbortSignal) =>
    request<void>(`/boards/${id}`, { method: 'DELETE', signal }),
  createColumn: (boardId: string, title: string, signal?: AbortSignal) =>
    request<Column>(`/boards/${boardId}/columns`, {
      method: 'POST',
      body: json({ title }),
      signal,
    }),
  updateColumn: (
    id: string,
    changes: Partial<Pick<Column, 'title' | 'position'>>,
    signal?: AbortSignal,
  ) => request<Column>(`/columns/${id}`, { method: 'PATCH', body: json(changes), signal }),
  deleteColumn: (id: string, signal?: AbortSignal) =>
    request<void>(`/columns/${id}`, { method: 'DELETE', signal }),
  createCard: (columnId: string, input: CreateCardInput, signal?: AbortSignal) =>
    request<Card>(`/columns/${columnId}/cards`, { method: 'POST', body: json(input), signal }),
  updateCard: (id: string, input: UpdateCardInput, signal?: AbortSignal) =>
    request<Card>(`/cards/${id}`, { method: 'PATCH', body: json(input), signal }),
  deleteCard: (id: string, signal?: AbortSignal) =>
    request<void>(`/cards/${id}`, { method: 'DELETE', signal }),
}
