import type { Board, Card, Column } from '@/types/api'

export interface Database {
  boards: Board[]
  columns: Column[]
  cards: Card[]
}

const now = '2026-11-01T09:00:00.000Z'

function card(
  id: string,
  columnId: string,
  position: number,
  title: string,
  extra: Partial<Card> = {},
): Card {
  return {
    id,
    columnId,
    position,
    title,
    description: '',
    priority: 'medium',
    labels: [],
    dueDate: null,
    createdAt: now,
    updatedAt: now,
    ...extra,
  }
}

export function createSeed(): Database {
  return {
    boards: [
      { id: 'board-launch', title: 'Website launch', createdAt: now },
      { id: 'board-personal', title: 'Personal', createdAt: now },
    ],
    columns: [
      { id: 'col-todo', boardId: 'board-launch', title: 'To do', position: 0 },
      { id: 'col-doing', boardId: 'board-launch', title: 'In progress', position: 1 },
      { id: 'col-review', boardId: 'board-launch', title: 'Review', position: 2 },
      { id: 'col-done', boardId: 'board-launch', title: 'Done', position: 3 },
      { id: 'col-p-todo', boardId: 'board-personal', title: 'Ideas', position: 0 },
      { id: 'col-p-done', boardId: 'board-personal', title: 'Done', position: 1 },
    ],
    cards: [
      card('card-1', 'col-todo', 0, 'Write the About page', {
        description: 'Team photos, short history, mission statement.',
        labels: ['content'],
        dueDate: '2026-12-01',
      }),
      card('card-2', 'col-todo', 1, 'Set up analytics', { priority: 'low', labels: ['dev'] }),
      card('card-3', 'col-todo', 2, 'Choose the hosting provider', {
        priority: 'high',
        labels: ['ops'],
        dueDate: '2026-11-20',
      }),
      card('card-4', 'col-doing', 0, 'Design the landing page', {
        description: 'Hero, features, pricing, footer. Mobile first.',
        priority: 'high',
        labels: ['design'],
      }),
      card('card-5', 'col-doing', 1, 'Build the contact form', { labels: ['dev'] }),
      card('card-6', 'col-review', 0, 'Logo variations', { labels: ['design'], priority: 'low' }),
      card('card-7', 'col-done', 0, 'Buy the domain name', { labels: ['ops'] }),
      card('card-8', 'col-done', 1, 'Kick-off meeting', { priority: 'low' }),
      card('card-9', 'col-p-todo', 0, 'Learn useOptimistic', {
        description: 'Read the React docs and build a small demo.',
        labels: ['learning'],
      }),
      card('card-10', 'col-p-done', 0, 'Finish ShopLite', {
        labels: ['learning'],
        priority: 'high',
      }),
    ],
  }
}
