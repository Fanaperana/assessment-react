import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

// Example test. Replace it with real tests as you build the app.
describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /flowboard/i })).toBeInTheDocument()
  })
})
