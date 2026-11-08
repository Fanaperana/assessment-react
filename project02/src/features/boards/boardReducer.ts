import type { Board, BoardDetail, Card, Column, Priority } from '@/types/api'

export interface BoardState {
  board: Board | null
  columnOrder: string[]
  columns: Record<string, Column>
  cardIdsByColumn: Record<string, string[]>
  cards: Record<string, Card>
}

export type BoardAction =
  | { type: 'LOAD'; detail: BoardDetail }
  | { type: 'SET_BOARD'; board: Board }
  | { type: 'ADD_COLUMN'; column: Column }
  | { type: 'PATCH_COLUMN'; column: Column }
  | { type: 'DELETE_COLUMN'; id: string }
  | { type: 'RESTORE_COLUMN'; column: Column; cards: Card[] }
  | { type: 'MOVE_COLUMN'; id: string; position: number }
  | { type: 'ADD_CARD'; card: Card }
  | { type: 'PATCH_CARD'; card: Card }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'MOVE_CARD'; id: string; columnId: string; position: number }
  | { type: 'REMAP_CARD'; oldId: string; card: Card }

export const emptyBoard: BoardState = {
  board: null,
  columnOrder: [],
  columns: {},
  cardIdsByColumn: {},
  cards: {},
}

export function normalizeBoard(detail: BoardDetail): BoardState {
  const columns = Object.fromEntries(detail.columns.map((column) => [column.id, column]))
  const cardIdsByColumn = Object.fromEntries(
    detail.columns.map((column) => [column.id, [] as string[]]),
  )
  const cards = Object.fromEntries(detail.cards.map((card) => [card.id, card]))
  detail.cards.forEach((card) => cardIdsByColumn[card.columnId]?.push(card.id))
  return {
    board: detail.board,
    columnOrder: [...detail.columns]
      .sort((a, b) => a.position - b.position)
      .map((column) => column.id),
    columns,
    cardIdsByColumn,
    cards,
  }
}

function withPositions(state: BoardState, orders: Record<string, string[]>): BoardState {
  const cards = { ...state.cards }
  Object.entries(orders).forEach(([columnId, ids]) => {
    ids.forEach((id, position) => {
      cards[id] = { ...cards[id], columnId, position }
    })
  })
  return { ...state, cards, cardIdsByColumn: { ...state.cardIdsByColumn, ...orders } }
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'LOAD':
      return normalizeBoard(action.detail)
    case 'SET_BOARD':
      return { ...state, board: action.board }
    case 'ADD_COLUMN':
      return {
        ...state,
        columnOrder: [...state.columnOrder, action.column.id],
        columns: { ...state.columns, [action.column.id]: action.column },
        cardIdsByColumn: { ...state.cardIdsByColumn, [action.column.id]: [] },
      }
    case 'PATCH_COLUMN':
      return {
        ...state,
        columns: { ...state.columns, [action.column.id]: action.column },
      }
    case 'DELETE_COLUMN': {
      const columns = { ...state.columns }
      const cards = { ...state.cards }
      const cardIdsByColumn = { ...state.cardIdsByColumn }
      cardIdsByColumn[action.id]?.forEach((id) => delete cards[id])
      delete columns[action.id]
      delete cardIdsByColumn[action.id]
      const columnOrder = state.columnOrder.filter((id) => id !== action.id)
      columnOrder.forEach((id, position) => {
        columns[id] = { ...columns[id], position }
      })
      return { ...state, columnOrder, columns, cards, cardIdsByColumn }
    }
    case 'RESTORE_COLUMN': {
      const columnOrder = [...state.columnOrder]
      columnOrder.splice(Math.min(columnOrder.length, action.column.position), 0, action.column.id)
      const columns = { ...state.columns, [action.column.id]: action.column }
      columnOrder.forEach((id, position) => {
        columns[id] = { ...columns[id], position }
      })
      const cards = { ...state.cards }
      const ids = [...action.cards]
        .sort((a, b) => a.position - b.position)
        .map((card) => {
          cards[card.id] = card
          return card.id
        })
      return {
        ...state,
        columnOrder,
        columns,
        cards,
        cardIdsByColumn: { ...state.cardIdsByColumn, [action.column.id]: ids },
      }
    }
    case 'MOVE_COLUMN': {
      const columnOrder = state.columnOrder.filter((id) => id !== action.id)
      if (columnOrder.length === state.columnOrder.length) return state
      columnOrder.splice(Math.min(columnOrder.length, Math.max(0, action.position)), 0, action.id)
      const columns = { ...state.columns }
      columnOrder.forEach((id, position) => {
        columns[id] = { ...columns[id], position }
      })
      return { ...state, columnOrder, columns }
    }
    case 'ADD_CARD': {
      const ids = [...(state.cardIdsByColumn[action.card.columnId] ?? [])]
      ids.splice(Math.min(ids.length, Math.max(0, action.card.position)), 0, action.card.id)
      return withPositions(
        { ...state, cards: { ...state.cards, [action.card.id]: action.card } },
        { [action.card.columnId]: ids },
      )
    }
    case 'PATCH_CARD':
      return {
        ...state,
        cards: { ...state.cards, [action.card.id]: action.card },
      }
    case 'DELETE_CARD': {
      const card = state.cards[action.id]
      if (!card) return state
      const cards = { ...state.cards }
      delete cards[action.id]
      const ids = state.cardIdsByColumn[card.columnId].filter((id) => id !== action.id)
      return withPositions({ ...state, cards }, { [card.columnId]: ids })
    }
    case 'MOVE_CARD': {
      const card = state.cards[action.id]
      if (!card || !state.columns[action.columnId]) return state
      const source = state.cardIdsByColumn[card.columnId].filter((id) => id !== action.id)
      const target =
        card.columnId === action.columnId ? source : [...state.cardIdsByColumn[action.columnId]]
      target.splice(Math.min(target.length, Math.max(0, action.position)), 0, action.id)
      return withPositions(state, { [card.columnId]: source, [action.columnId]: target })
    }
    case 'REMAP_CARD': {
      const old = state.cards[action.oldId]
      if (!old) return boardReducer(state, { type: 'ADD_CARD', card: action.card })
      const cards = { ...state.cards }
      delete cards[action.oldId]
      cards[action.card.id] = action.card
      const ids = state.cardIdsByColumn[old.columnId].map((id) =>
        id === action.oldId ? action.card.id : id,
      )
      return withPositions({ ...state, cards }, { [old.columnId]: ids })
    }
  }
}

export interface CardFilters {
  q: string
  priority: Priority | ''
  label: string
}

export function selectVisibleCards(
  state: BoardState,
  columnId: string,
  filters: CardFilters,
): Card[] {
  const query = filters.q.trim().toLocaleLowerCase()
  return (state.cardIdsByColumn[columnId] ?? [])
    .map((id) => state.cards[id])
    .filter(
      (card) =>
        card &&
        (!query || card.title.toLocaleLowerCase().includes(query)) &&
        (!filters.priority || card.priority === filters.priority) &&
        (!filters.label || card.labels.includes(filters.label)),
    )
}
