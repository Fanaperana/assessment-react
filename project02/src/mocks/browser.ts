import { setupWorker } from 'msw/browser'
import { loadBrowserOverrides } from './config'
import { handlers } from './handlers'

export async function startMockApi() {
  loadBrowserOverrides()
  const worker = setupWorker(...handlers)
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
