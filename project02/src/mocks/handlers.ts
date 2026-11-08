// Mock REST API for FlowBoard. Do not change this file for your solution.
// The full contract is documented in API.md.
import { delay, http, HttpResponse } from 'msw'
import type {
  ApiError,
  BoardSummary,
  Card,
  CreateCardInput,
  Priority,
  UpdateCardInput,
} from '@/types/api'
import { mockConfig } from './config'
import { getDb, renumber, save } from './db'

const PRIORITIES: Priority[] = ['low', 'medium', 'high']

function error(status: number, message: string) {
  return HttpResponse.json<ApiError>({ message }, { status })
}

async function wait() {
  const { minDelay, maxDelay } = mockConfig
  await delay(minDelay + Math.random() * Math.max(0, maxDelay - minDelay))
}

/** Writes fail randomly so that the app must handle errors and roll back. */
function randomFailure() {
  return Math.random() < mockConfig.failRate ? error(500, 'Server error. Please try again.') : null
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** Returns an error message, or null when the fields are valid. */
function validateCardFields(body: Record<string, unknown>, requireTitle: boolean): string | null {
  if (requireTitle || 'title' in body) {
    if (typeof body.title !== 'string' || body.title.trim() === '') return 'Title is required.'
    if (body.title.trim().length > 120) return 'Title must be 120 characters or fewer.'
  }
  if ('description' in body && typeof body.description !== 'string')
    return 'Description must be a string.'
  if ('priority' in body && !PRIORITIES.includes(body.priority as Priority))
    return 'Priority must be low, medium or high.'
  if (
    'labels' in body &&
    (!Array.isArray(body.labels) || !body.labels.every((label) => typeof label === 'string'))
  )
    return 'Labels must be an array of strings.'
  if (
    'dueDate' in body &&
    body.dueDate !== null &&
    (typeof body.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate))
  )
    return 'Due date must be YYYY-MM-DD or null.'
  if ('position' in body && (!Number.isInteger(body.position) || (body.position as number) < 0))
    return 'Position must be an integer of 0 or more.'
  return null
}

function sortedCards(columnId: string, exceptId?: string) {
  return getDb()
    .cards.filter((card) => card.columnId === columnId && card.id !== exceptId)
    .sort((a, b) => a.position - b.position)
}

function sortedColumns(boardId: string, exceptId?: string) {
  return getDb()
    .columns.filter((column) => column.boardId === boardId && column.id !== exceptId)
    .sort((a, b) => a.position - b.position)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export const handlers = [
  // ---------- Boards ----------
  http.get('/api/boards', async () => {
    await wait()
    const db = getDb()
    const summaries: BoardSummary[] = db.boards.map((board) => {
      const columnIds = new Set(
        db.columns.filter((column) => column.boardId === board.id).map((column) => column.id),
      )
      return {
        ...board,
        columnCount: columnIds.size,
        cardCount: db.cards.filter((card) => columnIds.has(card.columnId)).length,
      }
    })
    return HttpResponse.json(summaries)
  }),

  http.post('/api/boards', async ({ request }) => {
    await wait()
    const body = await readJson(request)
    if (!body || typeof body.title !== 'string' || body.title.trim() === '')
      return error(400, 'Title is required.')
    const failure = randomFailure()
    if (failure) return failure
    const board = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      createdAt: new Date().toISOString(),
    }
    getDb().boards.push(board)
    save()
    return HttpResponse.json(board, { status: 201 })
  }),

  http.get('/api/boards/:boardId', async ({ params }) => {
    await wait()
    const db = getDb()
    const board = db.boards.find((item) => item.id === params.boardId)
    if (!board) return error(404, 'Board not found.')
    const columns = sortedColumns(board.id)
    const cards = columns.flatMap((column) => sortedCards(column.id))
    return HttpResponse.json({ board, columns, cards })
  }),

  http.patch('/api/boards/:boardId', async ({ params, request }) => {
    await wait()
    const board = getDb().boards.find((item) => item.id === params.boardId)
    if (!board) return error(404, 'Board not found.')
    const body = await readJson(request)
    if (!body || typeof body.title !== 'string' || body.title.trim() === '')
      return error(400, 'Title is required.')
    const failure = randomFailure()
    if (failure) return failure
    board.title = body.title.trim()
    save()
    return HttpResponse.json(board)
  }),

  http.delete('/api/boards/:boardId', async ({ params }) => {
    await wait()
    const db = getDb()
    if (!db.boards.some((item) => item.id === params.boardId)) return error(404, 'Board not found.')
    const failure = randomFailure()
    if (failure) return failure
    const columnIds = new Set(
      db.columns.filter((column) => column.boardId === params.boardId).map((column) => column.id),
    )
    db.boards = db.boards.filter((item) => item.id !== params.boardId)
    db.columns = db.columns.filter((column) => !columnIds.has(column.id))
    db.cards = db.cards.filter((card) => !columnIds.has(card.columnId))
    save()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Columns ----------
  http.post('/api/boards/:boardId/columns', async ({ params, request }) => {
    await wait()
    const boardId = params.boardId as string
    if (!getDb().boards.some((item) => item.id === boardId)) return error(404, 'Board not found.')
    const body = await readJson(request)
    if (!body || typeof body.title !== 'string' || body.title.trim() === '')
      return error(400, 'Title is required.')
    const failure = randomFailure()
    if (failure) return failure
    const column = {
      id: crypto.randomUUID(),
      boardId,
      title: body.title.trim(),
      position: sortedColumns(boardId).length,
    }
    getDb().columns.push(column)
    save()
    return HttpResponse.json(column, { status: 201 })
  }),

  http.patch('/api/columns/:columnId', async ({ params, request }) => {
    await wait()
    const column = getDb().columns.find((item) => item.id === params.columnId)
    if (!column) return error(404, 'Column not found.')
    const body = await readJson(request)
    if (!body) return error(400, 'Body must be a JSON object.')
    if ('title' in body && (typeof body.title !== 'string' || body.title.trim() === ''))
      return error(400, 'Title is required.')
    if ('position' in body && (!Number.isInteger(body.position) || (body.position as number) < 0))
      return error(400, 'Position must be an integer of 0 or more.')
    const failure = randomFailure()
    if (failure) return failure
    if (typeof body.title === 'string') column.title = body.title.trim()
    if (typeof body.position === 'number') {
      const others = sortedColumns(column.boardId, column.id)
      others.splice(clamp(body.position, 0, others.length), 0, column)
      renumber(others)
    }
    save()
    return HttpResponse.json(column)
  }),

  http.delete('/api/columns/:columnId', async ({ params }) => {
    await wait()
    const db = getDb()
    const column = db.columns.find((item) => item.id === params.columnId)
    if (!column) return error(404, 'Column not found.')
    const failure = randomFailure()
    if (failure) return failure
    db.columns = db.columns.filter((item) => item.id !== column.id)
    db.cards = db.cards.filter((card) => card.columnId !== column.id)
    renumber(sortedColumns(column.boardId))
    save()
    return new HttpResponse(null, { status: 204 })
  }),

  // ---------- Cards ----------
  http.post('/api/columns/:columnId/cards', async ({ params, request }) => {
    await wait()
    const columnId = params.columnId as string
    if (!getDb().columns.some((item) => item.id === columnId))
      return error(404, 'Column not found.')
    const body = (await readJson(request)) as (CreateCardInput & Record<string, unknown>) | null
    if (!body) return error(400, 'Body must be a JSON object.')
    const invalid = validateCardFields(body, true)
    if (invalid) return error(400, invalid)
    const failure = randomFailure()
    if (failure) return failure
    const now = new Date().toISOString()
    const card: Card = {
      id: crypto.randomUUID(),
      columnId,
      title: body.title.trim(),
      description: body.description ?? '',
      priority: body.priority ?? 'medium',
      labels: body.labels ?? [],
      dueDate: body.dueDate ?? null,
      position: sortedCards(columnId).length,
      createdAt: now,
      updatedAt: now,
    }
    getDb().cards.push(card)
    save()
    return HttpResponse.json(card, { status: 201 })
  }),

  http.patch('/api/cards/:cardId', async ({ params, request }) => {
    await wait()
    const db = getDb()
    const card = db.cards.find((item) => item.id === params.cardId)
    if (!card) return error(404, 'Card not found.')
    const body = (await readJson(request)) as (UpdateCardInput & Record<string, unknown>) | null
    if (!body) return error(400, 'Body must be a JSON object.')
    const invalid = validateCardFields(body, false)
    if (invalid) return error(400, invalid)

    const sourceColumn = db.columns.find((column) => column.id === card.columnId)
    const targetColumn = db.columns.find((column) => column.id === (body.columnId ?? card.columnId))
    if (!targetColumn) return error(404, 'Column not found.')
    if (sourceColumn && targetColumn.boardId !== sourceColumn.boardId)
      return error(400, 'A card cannot move to a different board.')

    const failure = randomFailure()
    if (failure) return failure

    if (typeof body.title === 'string') card.title = body.title.trim()
    if (body.description !== undefined) card.description = body.description
    if (body.priority !== undefined) card.priority = body.priority
    if (body.labels !== undefined) card.labels = body.labels
    if (body.dueDate !== undefined) card.dueDate = body.dueDate

    if (body.columnId !== undefined || body.position !== undefined) {
      renumber(sortedCards(card.columnId, card.id))
      const target = sortedCards(targetColumn.id, card.id)
      target.splice(clamp(body.position ?? target.length, 0, target.length), 0, card)
      card.columnId = targetColumn.id
      renumber(target)
    }
    card.updatedAt = new Date().toISOString()
    save()
    return HttpResponse.json(card)
  }),

  http.delete('/api/cards/:cardId', async ({ params }) => {
    await wait()
    const db = getDb()
    const card = db.cards.find((item) => item.id === params.cardId)
    if (!card) return error(404, 'Card not found.')
    const failure = randomFailure()
    if (failure) return failure
    db.cards = db.cards.filter((item) => item.id !== card.id)
    renumber(sortedCards(card.columnId))
    save()
    return new HttpResponse(null, { status: 204 })
  }),
]
