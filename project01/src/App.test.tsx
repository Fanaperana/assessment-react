import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { productFixture } from './test/productFixture'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})
describe('App', () => {
  it('loads and displays products using mocked fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.includes('category-list')
                ? ['smartphones']
                : { products: [productFixture], total: 1, skip: 0, limit: 0 },
            ),
        }),
      ),
    )
    render(<App />)
    expect(await screen.findByText('Demo Phone')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalled()
  })
  it('moves an out-of-range catalog URL to the last available page', async () => {
    window.history.replaceState({}, '', '/?page=99')
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.includes('category-list')
                ? ['smartphones']
                : {
                    products: url.includes('skip=192') ? [productFixture] : [],
                    total: 194,
                    skip: 0,
                    limit: 12,
                  },
            ),
        }),
      ),
    )

    render(<App />)
    await waitFor(() => expect(window.location.search).toBe('?page=17'))
    expect(await screen.findByText('Demo Phone')).toBeInTheDocument()
    expect(screen.getByText('Page 17 of 17')).toBeInTheDocument()
  })
})
