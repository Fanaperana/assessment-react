import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('docs', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  for (const size of ['desktop', 'phone']) {
    for (const theme of ['light', 'dark']) {
      const viewport =
        size === 'desktop' ? { width: 1440, height: 900 } : { width: 360, height: 800 }
      const page = await browser.newPage({ viewport })
      await page.addInitScript((theme) => {
        localStorage.setItem('flowboard:theme', theme)
        localStorage.setItem('flowboard:delay', '0')
      }, theme)
      await page.goto('http://127.0.0.1:5173/boards/board-launch')
      await page.getByRole('heading', { name: 'Website launch' }).waitFor()
      await page.getByRole('link', { name: 'Write the About page' }).waitFor()
      await page.screenshot({ path: `docs/${size}-${theme}.png` })
      await page.close()
    }
  }
} finally {
  await browser.close()
}
