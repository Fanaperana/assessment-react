import { useState } from 'react'
import { Link } from 'react-router'
import type { CartItem as CartItemType } from '../reducers/cartReducer'
import { discountedPrice, formatMoney } from '../utils/money'
import { Button } from './Button'

interface CartItemProps {
  item: CartItemType
  onRemove: () => void
  onQuantityChange: (quantity: number) => void
}

export function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  const { product, quantity } = item
  const [draft, setDraft] = useState({ source: quantity, value: String(quantity) })
  const quantityText = draft.source === quantity ? draft.value : String(quantity)

  function commitQuantity() {
    const entered = Number(quantityText)
    const next = Number.isFinite(entered)
      ? Math.min(product.stock, Math.max(1, Math.trunc(entered)))
      : quantity
    setDraft({ source: quantity, value: String(next) })
    if (next !== quantity) onQuantityChange(next)
  }

  return (
    <article className="cart-item">
      <Link to={`/products/${product.id}`}>
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </Link>
      <div>
        <h2>
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h2>
        <p className="muted">{product.category.replaceAll('-', ' ')}</p>
        <Button variant="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <div className="cart-item__end">
        <strong>
          {formatMoney(discountedPrice(product.price, product.discountPercentage) * quantity)}
        </strong>
        <label>
          Qty
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantityText}
            onChange={(event) => setDraft({ source: quantity, value: event.target.value })}
            onBlur={commitQuantity}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
          />
        </label>
      </div>
    </article>
  )
}
