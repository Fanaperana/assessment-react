import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../components/Button'
import { EmptyState, ErrorMessage, Spinner } from '../components/Feedback'
import { useCart } from '../hooks/useCart'
import { useFetch } from '../hooks/useFetch'
import type { Product } from '../types/product'
import { discountedPrice, formatMoney } from '../utils/money'

export function ProductDetailPage() {
  const { id } = useParams()
  const validId = id && /^\d+$/.test(id) ? id : null
  const { data: product, error, isLoading, retry } = useFetch<Product>(validId ? `https://dummyjson.com/products/${validId}` : null)
  const [selectedImage, setSelectedImage] = useState<{ id: string; source: string } | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<{ id: string; value: number } | null>(null)
  const { dispatch } = useCart()

  if (!validId) return <EmptyState title="Product not found"><Link to="/">Back to shop</Link></EmptyState>
  if (isLoading) return <Spinner label="Loading product…" />
  if (error) return <ErrorMessage message={error} onRetry={retry} />
  if (!product) return <EmptyState title="Product not found"><Link to="/">Back to shop</Link></EmptyState>
  const image = selectedImage && selectedImage.id === id ? selectedImage.source : product.images[0] ?? product.thumbnail
  const quantity = selectedQuantity && selectedQuantity.id === id ? selectedQuantity.value : 1

  return <section className="detail-page">
    <Link className="back-link" to="/">← Back to shop</Link>
    <div className="detail-layout">
      <div className="gallery"><div className="gallery-main"><img src={image} alt={product.title} /></div><div className="gallery-thumbs">{(product.images.length ? product.images : [product.thumbnail]).map((source, index) => <button key={`${source}-${index}`} className={source === image ? 'selected' : ''} onClick={() => setSelectedImage({ id: id!, source })} aria-label={`Show image ${index + 1} of ${product.title}`} aria-pressed={source === image}><img src={source} alt={`${product.title}, view ${index + 1}`} loading="lazy" /></button>)}</div></div>
      <div className="detail-info"><span className="eyebrow">{product.category.replaceAll('-', ' ')}</span><h1>{product.title}</h1><p className="muted">★ {product.rating.toFixed(1)} · {product.stock} in stock</p><div className="detail-price"><strong>{formatMoney(discountedPrice(product.price, product.discountPercentage))}</strong>{product.discountPercentage > 0 && <><del>{formatMoney(product.price)}</del><span className="discount">-{product.discountPercentage.toFixed(0)}%</span></>}</div><p>{product.description}</p><div className="purchase-row"><label>Quantity<input type="number" min="1" max={product.stock} value={quantity} onChange={event => setSelectedQuantity({ id: id!, value: Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)) })} disabled={product.stock < 1} /></label><Button disabled={product.stock < 1} onClick={() => dispatch({ type: 'ADD_ITEM', product, quantity })}>Add to cart</Button></div>{product.stock < 1 && <p>Currently out of stock.</p>}</div>
    </div>
  </section>
}
