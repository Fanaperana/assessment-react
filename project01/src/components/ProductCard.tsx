import { memo } from 'react'
import { Link } from 'react-router'
import type { Product } from '../types/product'
import { discountedPrice, formatMoney } from '../utils/money'
import { Button } from './Button'

export interface ProductCardProps { product: Product; onAdd: (product: Product) => void }

export const ProductCard = memo(function ProductCard({ product, onAdd }: ProductCardProps) {
  return <article className="product-card">
    <Link className="product-card__image" to={`/products/${product.id}`} aria-label={`View ${product.title}`}>
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
    </Link>
    <div className="product-card__body">
      <span className="eyebrow">{product.category.replaceAll('-', ' ')}</span>
      <h3><Link to={`/products/${product.id}`}>{product.title}</Link></h3>
      <p className="muted">★ {product.rating.toFixed(1)} · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
      <div className="product-card__bottom">
        <div className="price"><strong>{formatMoney(discountedPrice(product.price, product.discountPercentage))}</strong>{product.discountPercentage > 0 && <del>{formatMoney(product.price)}</del>}</div>
        <Button onClick={() => onAdd(product)} disabled={product.stock < 1} aria-label={`Add ${product.title} to cart`}>Add to cart</Button>
      </div>
    </div>
  </article>
})
