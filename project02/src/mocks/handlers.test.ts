// Tests for the mock API itself. They also show how to call the API with fetch.
import { describe, expect, it } from 'vitest'
import type { BoardDetail, BoardSummary, Card } from '@/types/api'

async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

describe('mock API', () => {
  it('lists the seed boards', async () => {
    const boards = await json<BoardSummary[]>(await fetch('/api/boards'))
    expect(boards.map((board) => board.title)).toEqual(['Website launch', 'Personal'])
    expect(boards[0].columnCount).toBe(4)
  })

  it('returns 404 for an unknown board', async () => {
    const response = await fetch('/api/boards/nope')
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: 'Board not found.' })
  })

  it('moves a card to another column at a given position', async () => {
    const response = await fetch('/api/cards/card-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: 'col-doing', position: 1 }),
    })
    expect(response.status).toBe(200)
    expect(await json<Card>(response)).toMatchObject({ columnId: 'col-doing', position: 1 })

    const detail = await json<BoardDetail>(await fetch('/api/boards/board-launch'))
    const titlesIn = (columnId: string) =>
      detail.cards.filter((card) => card.columnId === columnId).map((card) => card.title)
    expect(titlesIn('col-doing')).toEqual([
      'Design the landing page',
      'Write the About page',
      'Build the contact form',
    ])
    expect(titlesIn('col-todo')).toEqual(['Set up analytics', 'Choose the hosting provider'])
  })

  it('rejects a card without a title', async () => {
    const response = await fetch('/api/columns/col-todo/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  ' }),
    })
    expect(response.status).toBe(400)
  })
})
