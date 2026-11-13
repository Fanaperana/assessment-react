import { Link } from 'react-router'
import { Button } from '../components/Button'
import { CartItem } from '../components/CartItem'
import { EmptyState } from '../components/Feedback'
import { OrderSummary } from '../components/OrderSummary'
import { useCart } from '../hooks/useCart'
import { discountedPrice, formatMoney } from '../utils/money'

export function CartPage() {
  const { items, dispatch } = useCart()
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const total = items.reduce(
    (sum, item) =>
      sum + discountedPrice(item.product.price, item.product.discountPercentage) * item.quantity,
    0,
  )
  const discount = subtotal - total

  return (
    <section className="cart-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR SELECTION</span>
          <h1>Your cart</h1>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Your cart is empty">
          <p>Find something you love in the shop.</p>
          <Link className="button button--primary" to="/">
            Browse products
          </Link>
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onRemove={() => dispatch({ type: 'REMOVE_ITEM', id: item.product.id })}
                onQuantityChange={(quantity) =>
                  dispatch({
                    type: 'UPDATE_QUANTITY',
                    id: item.product.id,
                    quantity,
                  })
                }
              />
            ))}
          </div>
          <OrderSummary title="Order summary">
            <div>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div>
              <span>Discount</span>
              <span>−{formatMoney(discount)}</span>
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>{formatMoney(total)}</strong>
            </div>
            <Link className="button button--primary checkout-link" to="/checkout">
              Continue to checkout →
            </Link>
            <Button variant="secondary" onClick={() => dispatch({ type: 'CLEAR_CART' })}>
              Clear cart
            </Button>
          </OrderSummary>
        </div>
      )}
    </section>
  )
}
