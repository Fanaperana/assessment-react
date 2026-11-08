import { expect, test } from '@playwright/test'

test('create board, add columns and card, move card, and reload', async ({ page }) => {
  const consoleProblems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      consoleProblems.push(message.text())
  })
  page.on('pageerror', (error) => consoleProblems.push(error.message))
  await page.addInitScript(() => localStorage.setItem('flowboard:failRate', '0'))
  await page.goto('/')
  await page.getByRole('button', { name: 'New board' }).click()
  await page.getByRole('textbox', { name: 'Board title' }).fill('Release planning')
  await page.getByRole('button', { name: 'Create board' }).click()
  await expect(page.getByRole('heading', { name: 'Release planning' })).toBeVisible()

  for (const title of ['Backlog', 'Done']) {
    await page.getByRole('button', { name: 'Add column' }).click()
    await page.getByRole('textbox', { name: 'Title' }).fill(title)
    await page.getByRole('dialog').getByRole('button', { name: 'Add column' }).click()
  }

  const columns = page.locator('[data-column-id]')
  await columns.nth(0).getByRole('button', { name: 'Add a card' }).click()
  await columns.nth(0).getByRole('textbox', { name: 'Card title' }).fill('Ship the release')
  await columns.nth(0).getByRole('button', { name: 'Add card' }).click()
  const card = columns.nth(0).getByRole('link', { name: 'Ship the release' })
  await expect(card).toBeVisible()
  await card.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  const doneId = await columns.nth(1).getAttribute('data-column-id')
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const response = await fetch('/api/boards/' + location.pathname.split('/')[2])
        const detail = (await response.json()) as { cards: { title: string; columnId: string }[] }
        return detail.cards.find((card) => card.title === 'Ship the release')?.columnId
      }),
    )
    .toBe(doneId)
  await expect(columns.nth(1).getByRole('link', { name: 'Ship the release' })).toBeVisible()
  await page.reload()
  await expect(columns.nth(1).getByRole('link', { name: 'Ship the release' })).toBeVisible()
  expect(consoleProblems).toEqual([])
})

test('pointer drag moves a card and reorders columns', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('flowboard:failRate', '0'))
  await page.goto('/boards/board-launch')
  const columns = page.locator('[data-column-id]')
  await expect(columns).toHaveCount(4)
  await page
    .locator('[data-card-id="card-1"] [data-card-drag-handle]')
    .dragTo(columns.nth(1).locator('[data-card-list]'), { targetPosition: { x: 20, y: 20 } })
  await expect(columns.nth(1).getByRole('link', { name: 'Write the About page' })).toBeVisible()
  await columns
    .nth(0)
    .locator('[data-column-drag-handle]')
    .dragTo(columns.nth(2).locator('header'), { targetPosition: { x: 10, y: 10 } })
  await expect(columns.nth(0).getByRole('button', { name: /^In progress \d+$/ })).toBeVisible()
})
