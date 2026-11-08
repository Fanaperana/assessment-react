import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { api } from '@/api/client'
import { server } from '@/mocks/node'

beforeEach(() => window.history.pushState({}, '', '/boards/board-launch'))

function column(id: string) {
  const element = document.querySelector<HTMLElement>(`[data-column-id="${id}"]`)
  if (!element) throw new Error(`Missing column ${id}`)
  return element
}

describe('board interactions', () => {
  it('adds a card with the quick form and keeps the form open', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Website launch' })
    await user.click(within(column('col-todo')).getByRole('button', { name: 'Add a card' }))
    await user.type(
      within(column('col-todo')).getByRole('textbox', { name: 'Card title' }),
      'Check navigation{Enter}',
    )
    expect(
      await within(column('col-todo')).findByRole('link', { name: 'Check navigation' }),
    ).toBeInTheDocument()
    expect(within(column('col-todo')).getByRole('textbox', { name: 'Card title' })).toHaveValue('')
  })

  it('moves a card by keyboard and sends its target position', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = await screen.findByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    await waitFor(async () =>
      expect(
        (await api.getBoard('board-launch')).cards.find((item) => item.id === 'card-1'),
      ).toMatchObject({ columnId: 'col-doing', position: 0 }),
    )
    expect(
      within(column('col-doing')).getByRole('link', { name: 'Write the About page' }),
    ).toBeInTheDocument()
  })

  it('rolls back a failed move and shows a Retry toast', async () => {
    server.use(
      http.patch('/api/cards/:cardId', () =>
        HttpResponse.json({ message: 'Server unavailable' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    render(<App />)
    const card = await screen.findByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    await waitFor(() =>
      expect(
        within(column('col-todo')).getByRole('link', { name: 'Write the About page' }),
      ).toBeInTheDocument(),
    )
    expect(await screen.findByText('Could not move card')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('serializes two quick moves of the same card', async () => {
    const requests: string[] = []
    let firstFinished = false
    let secondStartedEarly = false
    server.use(
      http.patch('/api/cards/:cardId', async ({ request }) => {
        const input = (await request.json()) as { columnId: string; position: number }
        if (requests.length === 1 && !firstFinished) secondStartedEarly = true
        requests.push(input.columnId)
        if (requests.length === 1) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          firstFinished = true
        }
        return HttpResponse.json({ id: 'card-1', ...input })
      }),
    )
    const user = userEvent.setup()
    render(<App />)
    let card = await screen.findByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    card = within(column('col-doing')).getByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    await waitFor(() => expect(requests).toEqual(['col-doing', 'col-review']))
    expect(secondStartedEarly).toBe(false)
    expect(
      within(column('col-review')).getByRole('link', { name: 'Write the About page' }),
    ).toBeInTheDocument()
  })

  it('undoes a deleted card and restores it through the API', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: 'Write the About page' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete card' }),
    )
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete card' }),
    )
    await screen.findByText('Card deleted')
    await user.keyboard('{Control>}z{/Control}')
    await waitFor(async () =>
      expect(
        (await api.getBoard('board-launch')).cards.some(
          (card) => card.title === 'Write the About page',
        ),
      ).toBe(true),
    )
    await waitFor(() =>
      expect(
        within(column('col-todo')).getByRole('link', { name: 'Write the About page' }),
      ).toBeInTheDocument(),
    )
  })

  it('reads filters from the URL', async () => {
    window.history.pushState({}, '', '/boards/board-launch?q=analytics&priority=high')
    render(<App />)
    await screen.findByRole('heading', { name: 'Website launch' })
    expect(screen.getByRole('searchbox', { name: /search/i })).toHaveValue('analytics')
  })

  it('reorders a column with Space and arrow keys', async () => {
    const user = userEvent.setup()
    render(<App />)
    const handle = await screen.findByRole('button', { name: 'Drag To do' })
    handle.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    await waitFor(() =>
      expect(document.querySelector<HTMLElement>('[data-column-id]')?.dataset.columnId).toBe(
        'col-doing',
      ),
    )
    await waitFor(async () =>
      expect(
        (await api.getBoard('board-launch')).columns.find((column) => column.id === 'col-todo')
          ?.position,
      ).toBe(1),
    )
  })

  it('restores focus to the card after closing its route dialog', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = await screen.findByRole('link', { name: 'Write the About page' })
    await user.click(card)
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(card).toHaveFocus())
    expect(window.location.pathname).toBe('/boards/board-launch')
  })

  it('saves card title and description from the dialog', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(await screen.findByRole('link', { name: 'Write the About page' }))
    const dialog = await screen.findByRole('dialog')
    await user.clear(within(dialog).getByRole('textbox', { name: 'Title' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Title' }), 'Write release notes')
    await user.clear(within(dialog).getByRole('textbox', { name: 'Description' }))
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Description' }),
      'For the next launch',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(await screen.findByRole('link', { name: 'Write release notes' })).toBeInTheDocument()
    await waitFor(async () =>
      expect(
        (await api.getBoard('board-launch')).cards.find((item) => item.id === 'card-1'),
      ).toMatchObject({ title: 'Write release notes', description: 'For the next launch' }),
    )
  })
})
