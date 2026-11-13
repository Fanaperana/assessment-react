import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(pathToFileURL(resolve('lighthouse-board.report.html')).href)
  await mkdir('docs', { recursive: true })
  await page.screenshot({ path: 'docs/lighthouse-accessibility.png' })
} finally {
  await browser.close()
}
