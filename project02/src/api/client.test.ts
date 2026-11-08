import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/node'
import { api, ApiError } from './client'

describe('typed API client', () => {
  it('loads board summaries', async () => {
    const boards = await api.listBoards()
    expect(boards[0]).toMatchObject({ id: 'board-launch', columnCount: 4 })
  })
  it('loads a board with columns and cards', async () => {
    const detail = await api.getBoard('board-launch')
    expect(detail.columns).toHaveLength(4)
    expect(detail.cards.length).toBeGreaterThan(0)
  })
  it('throws ApiError with the status and message for 404', async () => {
    await expect(api.getBoard('missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Board not found.',
    })
  })
  it('throws ApiError for a server failure', async () => {
    server.use(
      http.get('/api/boards', () => HttpResponse.json({ message: 'Try later' }, { status: 500 })),
    )
    await expect(api.listBoards()).rejects.toEqual(new ApiError(500, 'Try later'))
  })
  it('creates and retrieves a new card', async () => {
    const card = await api.createCard('col-todo', { title: 'Review the copy' })
    expect(card.title).toBe('Review the copy')
    expect((await api.getBoard('board-launch')).cards.some((item) => item.id === card.id)).toBe(
      true,
    )
  })
  it('returns void for a 204 delete response', async () => {
    expect(await api.deleteCard('card-1')).toBeUndefined()
    expect((await api.getBoard('board-launch')).cards.some((card) => card.id === 'card-1')).toBe(
      false,
    )
  })
})
