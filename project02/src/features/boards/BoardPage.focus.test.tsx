import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'

beforeEach(() => window.history.pushState({}, '', '/boards/board-launch'))

function column(id: string) {
  const element = document.querySelector<HTMLElement>(`[data-column-id="${id}"]`)
  if (!element) throw new Error(`Missing column ${id}`)
  return element
}

describe('board focus management', () => {
  it('restores focus to the opener after closing its route dialog with Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = await screen.findByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(card).toHaveFocus())
    expect(window.location.pathname).toBe('/boards/board-launch')
  })

  it('keeps focus on the card after a keyboard drop', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = await screen.findByRole('link', { name: 'Write the About page' })
    card.focus()
    await user.keyboard('[Space][ArrowRight][Space]')
    await waitFor(() =>
      expect(
        within(column('col-doing')).getByRole('link', { name: 'Write the About page' }),
      ).toHaveFocus(),
    )
  })
})
