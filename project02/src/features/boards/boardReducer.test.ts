import { describe, expect, it } from 'vitest'
import { createSeed } from '@/mocks/seed'
import { boardReducer, normalizeBoard, selectVisibleCards } from './boardReducer'

function seedBoard() {
  const seed = createSeed()
  return normalizeBoard({
    board: seed.boards[0],
    columns: seed.columns.filter((column) => column.boardId === seed.boards[0].id),
    cards: seed.cards.filter((card) =>
      seed.columns.some(
        (column) => column.boardId === seed.boards[0].id && column.id === card.columnId,
      ),
    ),
  })
}

describe('boardReducer', () => {
  it('normalizes columns and card order', () => {
    const state = seedBoard()
    expect(state.columnOrder).toEqual(['col-todo', 'col-doing', 'col-review', 'col-done'])
    expect(state.cardIdsByColumn['col-todo']).toEqual(['card-1', 'card-2', 'card-3'])
  })
  it('moves a card between columns without changing the old state', () => {
    const state = seedBoard()
    const next = boardReducer(state, {
      type: 'MOVE_CARD',
      id: 'card-1',
      columnId: 'col-doing',
      position: 1,
    })
    expect(next.cardIdsByColumn['col-todo']).toEqual(['card-2', 'card-3'])
    expect(next.cardIdsByColumn['col-doing']).toEqual(['card-4', 'card-1', 'card-5'])
    expect(next.cards['card-1'].position).toBe(1)
    expect(state.cards['card-1'].columnId).toBe('col-todo')
  })
  it('reorders a card in the same column', () => {
    const next = boardReducer(seedBoard(), {
      type: 'MOVE_CARD',
      id: 'card-1',
      columnId: 'col-todo',
      position: 2,
    })
    expect(next.cardIdsByColumn['col-todo']).toEqual(['card-2', 'card-3', 'card-1'])
  })
  it('removes a column and its cards', () => {
    const next = boardReducer(seedBoard(), { type: 'DELETE_COLUMN', id: 'col-todo' })
    expect(next.cards['card-1']).toBeUndefined()
    expect(next.columns['col-todo']).toBeUndefined()
    expect(next.columnOrder).toHaveLength(3)
  })
  it('filters cards by text, priority, and label', () => {
    const cards = selectVisibleCards(seedBoard(), 'col-doing', {
      q: 'design',
      priority: 'high',
      label: 'design',
    })
    expect(cards.map((card) => card.id)).toEqual(['card-4'])
  })
})
