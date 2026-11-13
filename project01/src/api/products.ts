export const PAGE_SIZE = 12
export const PRODUCTS_API = 'https://dummyjson.com/products'

export interface ProductQuery {
  query: string
  category: string
  sort: string
  page: number
}

export function productListUrl({ query, category, sort, page }: ProductQuery): string {
  if (query) return `${PRODUCTS_API}/search?q=${encodeURIComponent(query)}&limit=0`
  if (category) return `${PRODUCTS_API}/category/${encodeURIComponent(category)}?limit=0`

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String((page - 1) * PAGE_SIZE),
  })
  if (sort === 'price-asc' || sort === 'price-desc') {
    params.set('sortBy', 'price')
    params.set('order', sort === 'price-asc' ? 'asc' : 'desc')
  } else if (sort === 'rating-desc') {
    params.set('sortBy', 'rating')
    params.set('order', 'desc')
  }
  return `${PRODUCTS_API}?${params}`
}
