import { toast } from 'sonner'
import { api } from '@/api/client'
import type { Board, Card, Column, CreateCardInput, UpdateCardInput } from '@/types/api'
import { useAbortable } from '@/hooks/useAbortable'
import type { HistoryAction, HistoryState } from '@/features/history/historyReducer'
import { useBoards } from './useBoards'

interface Store {
  boardId: string
  send: (action: HistoryAction) => void
  getState: () => HistoryState
}

function report(title: string, reason: unknown, retry: () => void) {
  toast.error(title, {
    description: reason instanceof Error ? reason.message : undefined,
    action: { label: 'Retry', onClick: retry },
  })
}

export function useBoardMutations({ boardId, send, getState }: Store) {
  const run = useAbortable()
  const { reload } = useBoards()

  async function createColumn(title: string): Promise<Column> {
    const column = await run((signal) => api.createColumn(boardId, title, signal))
    send({ type: 'APPLY', action: { type: 'ADD_COLUMN', column } })
    reload()
    return column
  }

  async function renameColumn(id: string, title: string) {
    const previous = getState().present.columns[id]
    if (!previous || !title.trim()) return
    const optimistic = { ...previous, title: title.trim() }
    send({ type: 'APPLY', action: { type: 'PATCH_COLUMN', column: optimistic } })
    try {
      const updated = await run((signal) => api.updateColumn(id, { title }, signal))
      send({ type: 'APPLY', action: { type: 'PATCH_COLUMN', column: updated } })
    } catch (reason) {
      send({ type: 'APPLY', action: { type: 'PATCH_COLUMN', column: previous } })
      report('Could not rename column', reason, () => void renameColumn(id, title))
    }
  }

  async function deleteColumn(id: string) {
    const state = getState().present
    const column = state.columns[id]
    if (!column) return
    const cards = state.cardIdsByColumn[id].map((cardId) => state.cards[cardId])
    send({ type: 'APPLY', action: { type: 'DELETE_COLUMN', id } })
    try {
      await run((signal) => api.deleteColumn(id, signal))
      reload()
    } catch (reason) {
      send({ type: 'APPLY', action: { type: 'RESTORE_COLUMN', column, cards } })
      report('Could not delete column', reason, () => void deleteColumn(id))
    }
  }

  async function moveColumn(id: string, position: number) {
    const previous = getState().present.columns[id]
    if (!previous || previous.position === position) return
    send({ type: 'APPLY', action: { type: 'MOVE_COLUMN', id, position } })
    try {
      await run((signal) => api.updateColumn(id, { position }, signal))
    } catch (reason) {
      send({ type: 'APPLY', action: { type: 'MOVE_COLUMN', id, position: previous.position } })
      report('Could not move column', reason, () => void moveColumn(id, position))
    }
  }

  async function createCard(columnId: string, input: CreateCardInput): Promise<Card> {
    const card = await run((signal) => api.createCard(columnId, input, signal))
    send({ type: 'APPLY', action: { type: 'ADD_CARD', card } })
    reload()
    return card
  }

  async function updateCard(id: string, input: UpdateCardInput) {
    const previous = getState().present.cards[id]
    if (!previous) return
    const optimistic: Card = { ...previous, ...input }
    send({ type: 'APPLY', action: { type: 'PATCH_CARD', card: optimistic } })
    try {
      await run((signal) => api.updateCard(id, input, signal))
    } catch (reason) {
      const current = getState().present.cards[id]
      if (
        current &&
        Object.entries(input).every(
          ([key, value]) => JSON.stringify(current[key as keyof Card]) === JSON.stringify(value),
        )
      )
        send({ type: 'APPLY', action: { type: 'PATCH_CARD', card: previous } })
      report('Could not save card', reason, () => void updateCard(id, input))
    }
  }

  async function deleteCard(id: string) {
    const card = getState().present.cards[id]
    if (!card) return
    const operation = { kind: 'delete' as const, id: crypto.randomUUID(), card }
    send({ type: 'RECORD', operation })
    try {
      await run((signal) => api.deleteCard(id, signal))
      reload()
      toast.success('Card deleted', {
        action: {
          label: 'Undo',
          onClick: () => window.dispatchEvent(new CustomEvent('flowboard:undo')),
        },
      })
    } catch (reason) {
      send({ type: 'DISCARD', id: operation.id, rollback: { type: 'ADD_CARD', card } })
      report('Could not delete card', reason, () => void deleteCard(id))
    }
  }

  async function renameBoard(title: string) {
    const previous = getState().present.board
    if (!previous || !title.trim()) return
    const optimistic: Board = { ...previous, title: title.trim() }
    send({ type: 'APPLY', action: { type: 'SET_BOARD', board: optimistic } })
    try {
      const updated = await run((signal) => api.updateBoard(boardId, title, signal))
      send({ type: 'APPLY', action: { type: 'SET_BOARD', board: updated } })
      reload()
    } catch (reason) {
      send({ type: 'APPLY', action: { type: 'SET_BOARD', board: previous } })
      report('Could not rename board', reason, () => void renameBoard(title))
    }
  }

  return {
    createColumn,
    renameColumn,
    deleteColumn,
    moveColumn,
    createCard,
    updateCard,
    deleteCard,
    renameBoard,
  }
}
