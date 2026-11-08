import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PAGE_SIZE, PRODUCTS_API, productListUrl } from '../api/products'
import { CatalogFilters } from '../components/CatalogFilters'
import { EmptyState, ErrorMessage, Spinner } from '../components/Feedback'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../hooks/useCart'
import { useDebounce } from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import type { Product, ProductListResponse } from '../types/product'

export function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? ''
  const requestedPage = Number(params.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  // Keep the typed value until debounce completes, but use the URL after browser navigation.
  const [draft, setDraft] = useState({ source: query, value: query })
  const input = draft.source === query ? draft.value : query
  const debounced = useDebounce(input.trim(), 400)
  const { dispatch } = useCart()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        Object.entries(updates).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key),
        )
        return next
      })
    },
    [setParams],
  )

  useEffect(() => {
    if (draft.source === query && debounced !== query) updateParams({ q: debounced, page: '' })
  }, [debounced, draft.source, query, updateParams])

  const productsUrl = productListUrl({ query, category, sort, page })
  const { data, error, isLoading, retry } = useFetch<ProductListResponse>(productsUrl)
  const categories = useFetch<string[]>(`${PRODUCTS_API}/category-list`)

  // Search and category have separate endpoints, so combine their results in the browser.
  const clientSideList = Boolean(query || category)
  const filtered = useMemo(() => {
    const matching = (data?.products ?? []).filter(
      (product) => !category || product.category === category,
    )
    if (!clientSideList) return matching
    return [...matching].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'rating-desc') return b.rating - a.rating
      return a.id - b.id
    })
  }, [data, category, sort, clientSideList])

  const total = clientSideList ? filtered.length : (data?.total ?? 0)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const visible = clientSideList
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered
  const addToCart = useCallback(
    (product: Product) => dispatch({ type: 'ADD_ITEM', product, quantity: 1 }),
    [dispatch],
  )

  useEffect(() => {
    if (data && page > pages) updateParams({ page: String(pages) })
  }, [data, page, pages, updateParams])

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">THE EVERYDAY EDIT</span>
          <h1>
            Find your next
            <br />
            <em>favorite thing.</em>
          </h1>
          <p>
            Thoughtful finds for every day. Explore our collection and discover something worth
            keeping.
          </p>
          <a className="hero-link" href="#products">
            Explore products <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit" />
          <span>✦</span>
        </div>
      </section>

      <section id="products" className="catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURATED FOR YOU</span>
            <h2 id="catalog-title">Discover products</h2>
          </div>
          <span className="result-count">{total} products</span>
        </div>
        <CatalogFilters
          query={input}
          category={category}
          sort={sort}
          categories={categories.data ?? []}
          onQueryChange={(value) => setDraft({ source: query, value })}
          onCategoryChange={(value) => updateParams({ category: value, page: '' })}
          onSortChange={(value) => updateParams({ sort: value, page: '' })}
        />
        {categories.error && (
          <ErrorMessage message={`Categories: ${categories.error}`} onRetry={categories.retry} />
        )}
        {categories.isLoading && (
          <p className="muted" role="status">
            Loading categories…
          </p>
        )}

        {isLoading || (data && page > pages) ? (
          <Spinner label="Loading products…" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={retry} />
        ) : !data || total === 0 ? (
          <EmptyState title="No products found">
            <p>Try another search or category.</p>
          </EmptyState>
        ) : (
          <>
            <div className="product-grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
            <Pagination
              page={page}
              pages={pages}
              onPageChange={(next) => updateParams({ page: String(next) })}
            />
          </>
        )}
      </section>
    </>
  )
}
