import { describe, expect, it } from 'vitest'
import { createSeed } from '@/mocks/seed'
import { emptyHistory, historyReducer } from './historyReducer'

function loaded() {
  const seed = createSeed()
  return historyReducer(emptyHistory, {
    type: 'LOAD',
    detail: {
      board: seed.boards[0],
      columns: seed.columns.filter((column) => column.boardId === seed.boards[0].id),
      cards: seed.cards.slice(0, 8),
    },
  })
}

describe('historyReducer', () => {
  it('records and undoes a move', () => {
    const moved = historyReducer(loaded(), {
      type: 'RECORD',
      operation: {
        kind: 'move',
        id: 'op-1',
        cardId: 'card-1',
        from: { columnId: 'col-todo', position: 0 },
        to: { columnId: 'col-doing', position: 1 },
      },
    })
    expect(moved.present.cards['card-1'].columnId).toBe('col-doing')
    const undone = historyReducer(moved, { type: 'UNDO' })
    expect(undone.present.cards['card-1'].columnId).toBe('col-todo')
    expect(undone.future).toHaveLength(1)
  })
  it('redoes an undone move', () => {
    const move = {
      kind: 'move' as const,
      id: 'op-2',
      cardId: 'card-1',
      from: { columnId: 'col-todo', position: 0 },
      to: { columnId: 'col-review', position: 0 },
    }
    const state = historyReducer(
      historyReducer(historyReducer(loaded(), { type: 'RECORD', operation: move }), {
        type: 'UNDO',
      }),
      { type: 'REDO' },
    )
    expect(state.present.cards['card-1'].columnId).toBe('col-review')
  })
  it('restores a deleted card on undo', () => {
    const card = loaded().present.cards['card-1']
    const deleted = historyReducer(loaded(), {
      type: 'RECORD',
      operation: { kind: 'delete', id: 'op-3', card },
    })
    expect(deleted.present.cards['card-1']).toBeUndefined()
    expect(historyReducer(deleted, { type: 'UNDO' }).present.cards['card-1']).toBeDefined()
  })
  it('clears future on a new operation', () => {
    const card = loaded().present.cards['card-1']
    const state = historyReducer(
      historyReducer(
        historyReducer(loaded(), {
          type: 'RECORD',
          operation: { kind: 'delete', id: 'op-4', card },
        }),
        { type: 'UNDO' },
      ),
      { type: 'RECORD', operation: { kind: 'delete', id: 'op-5', card } },
    )
    expect(state.future).toHaveLength(0)
  })
  it('discards a failed operation and applies its rollback', () => {
    const moved = historyReducer(loaded(), {
      type: 'RECORD',
      operation: {
        kind: 'move',
        id: 'op-6',
        cardId: 'card-1',
        from: { columnId: 'col-todo', position: 0 },
        to: { columnId: 'col-doing', position: 0 },
      },
    })
    const rolledBack = historyReducer(moved, {
      type: 'DISCARD',
      id: 'op-6',
      rollback: { type: 'MOVE_CARD', id: 'card-1', columnId: 'col-todo', position: 0 },
    })
    expect(rolledBack.present.cards['card-1'].columnId).toBe('col-todo')
    expect(rolledBack.past).toHaveLength(0)
  })
})
