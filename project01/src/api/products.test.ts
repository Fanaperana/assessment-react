import { describe, expect, it } from 'vitest'
import { productListUrl } from './products'

const base = { query: '', category: '', sort: '', page: 1 }

describe('productListUrl', () => {
  it('requests 12 products for the first page', () => {
    expect(productListUrl(base)).toBe('https://dummyjson.com/products?limit=12&skip=0')
  })
  it('uses skip and server sorting for later pages', () => {
    expect(productListUrl({ ...base, page: 2, sort: 'price-asc' })).toBe(
      'https://dummyjson.com/products?limit=12&skip=12&sortBy=price&order=asc',
    )
    expect(productListUrl({ ...base, sort: 'rating-desc' })).toContain('sortBy=rating&order=desc')
  })
  it('uses the category endpoint', () => {
    expect(productListUrl({ ...base, category: 'smartphones' })).toBe(
      'https://dummyjson.com/products/category/smartphones?limit=0',
    )
  })
  it('uses the search endpoint when search and category are combined', () => {
    expect(productListUrl({ ...base, query: 'red phone', category: 'smartphones' })).toBe(
      'https://dummyjson.com/products/search?q=red%20phone&limit=0',
    )
  })
})
