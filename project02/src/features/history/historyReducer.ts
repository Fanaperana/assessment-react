import type { BoardDetail, Card } from '@/types/api'
import { boardReducer, emptyBoard } from '@/features/boards/boardReducer'
import type { BoardAction, BoardState } from '@/features/boards/boardReducer'

export interface Location {
  columnId: string
  position: number
}
export type HistoryOperation =
  | { kind: 'move'; id: string; cardId: string; from: Location; to: Location }
  | { kind: 'delete'; id: string; card: Card }

export interface HistoryState {
  past: HistoryOperation[]
  present: BoardState
  future: HistoryOperation[]
}

export type HistoryAction =
  | { type: 'LOAD'; detail: BoardDetail }
  | { type: 'APPLY'; action: BoardAction }
  | { type: 'RECORD'; operation: HistoryOperation }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DISCARD'; id: string; rollback?: BoardAction }
  | { type: 'REMAP_CARD'; oldId: string; card: Card }

export const emptyHistory: HistoryState = { past: [], present: emptyBoard, future: [] }

function applyOperation(state: BoardState, operation: HistoryOperation): BoardState {
  return operation.kind === 'move'
    ? boardReducer(state, { type: 'MOVE_CARD', id: operation.cardId, ...operation.to })
    : boardReducer(state, { type: 'DELETE_CARD', id: operation.card.id })
}

function reverseOperation(state: BoardState, operation: HistoryOperation): BoardState {
  return operation.kind === 'move'
    ? boardReducer(state, { type: 'MOVE_CARD', id: operation.cardId, ...operation.from })
    : boardReducer(state, { type: 'ADD_CARD', card: operation.card })
}

function remap(operation: HistoryOperation, oldId: string, card: Card): HistoryOperation {
  if (operation.kind === 'move')
    return operation.cardId === oldId ? { ...operation, cardId: card.id } : operation
  return operation.card.id === oldId
    ? { ...operation, card: { ...card, position: operation.card.position } }
    : operation
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'LOAD':
      return {
        past: [],
        present: boardReducer(emptyBoard, { type: 'LOAD', detail: action.detail }),
        future: [],
      }
    case 'APPLY':
      return { ...state, present: boardReducer(state.present, action.action) }
    case 'RECORD':
      return {
        past: [...state.past, action.operation].slice(-50),
        present: applyOperation(state.present, action.operation),
        future: [],
      }
    case 'UNDO': {
      const operation = state.past.at(-1)
      if (!operation) return state
      return {
        past: state.past.slice(0, -1),
        present: reverseOperation(state.present, operation),
        future: [operation, ...state.future],
      }
    }
    case 'REDO': {
      const [operation, ...future] = state.future
      if (!operation) return state
      return {
        past: [...state.past, operation],
        present: applyOperation(state.present, operation),
        future,
      }
    }
    case 'DISCARD':
      return {
        past: state.past.filter((operation) => operation.id !== action.id),
        present: action.rollback ? boardReducer(state.present, action.rollback) : state.present,
        future: state.future.filter((operation) => operation.id !== action.id),
      }
    case 'REMAP_CARD':
      return {
        past: state.past.map((operation) => remap(operation, action.oldId, action.card)),
        present: boardReducer(state.present, {
          type: 'REMAP_CARD',
          oldId: action.oldId,
          card: action.card,
        }),
        future: state.future.map((operation) => remap(operation, action.oldId, action.card)),
      }
  }
}
