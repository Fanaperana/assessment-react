import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Mock API server for tests. Use server.use(...) in a test to override a handler. */
export const server = setupServer(...handlers)
