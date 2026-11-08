import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { mockConfig } from '@/mocks/config'
import { resetDb } from '@/mocks/db'
import { server } from '@/mocks/node'

// Tests must be fast and deterministic: no delay, no random failures, no localStorage.
mockConfig.minDelay = 0
mockConfig.maxDelay = 0
mockConfig.failRate = 0
mockConfig.persist = false

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => resetDb())
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())
