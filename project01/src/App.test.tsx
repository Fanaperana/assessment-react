import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { productFixture } from './test/productFixture'

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
describe('App', () => {
  it('loads and displays products using mocked fetch', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(url.includes('category-list') ? ['smartphones'] : { products: [productFixture], total: 1, skip: 0, limit: 0 }),
    })))
    render(<App />)
    expect(await screen.findByText('Demo Phone')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalled()
  })
})
