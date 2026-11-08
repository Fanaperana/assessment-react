import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Start the mock API before the first render, so the first fetch is already mocked.
// It is a dynamic import, so MSW goes into its own chunk.
async function startMockApi() {
  const { startMockApi } = await import('./mocks/browser')
  await startMockApi()
}

startMockApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
