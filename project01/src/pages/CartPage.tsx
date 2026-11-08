import { Link } from 'react-router'
import { Button } from '../components/Button'
import { EmptyState } from '../components/Feedback'
import { useCart } from '../hooks/useCart'
import { discountedPrice, formatMoney } from '../utils/money'

export function CartPage() {
  const { items, dispatch } = useCart()
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const total = items.reduce((sum, item) => sum + discountedPrice(item.product.price, item.product.discountPercentage) * item.quantity, 0)
  const discount = subtotal - total
  return <section className="cart-page"><div className="section-heading"><div><span className="eyebrow">YOUR SELECTION</span><h1>Your cart</h1></div></div>
    {items.length === 0 ? <EmptyState title="Your cart is empty"><p>Find something you love in the shop.</p><Link className="button button--primary" to="/">Browse products</Link></EmptyState> : <div className="cart-layout"><div className="cart-items">{items.map(item => <article className="cart-item" key={item.product.id}><Link to={`/products/${item.product.id}`}><img src={item.product.thumbnail} alt={item.product.title} loading="lazy" /></Link><div><h2><Link to={`/products/${item.product.id}`}>{item.product.title}</Link></h2><p className="muted">{item.product.category.replaceAll('-', ' ')}</p><Button variant="danger" onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.product.id })}>Remove</Button></div><div className="cart-item__end"><strong>{formatMoney(discountedPrice(item.product.price, item.product.discountPercentage) * item.quantity)}</strong><label>Qty <input type="number" min="1" max={item.product.stock} value={item.quantity} onChange={event => dispatch({ type: 'UPDATE_QUANTITY', id: item.product.id, quantity: Number(event.target.value) || 1 })} /></label></div></article>)}</div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div><div><span>Discount</span><span>−{formatMoney(discount)}</span></div><div className="summary-total"><strong>Total</strong><strong>{formatMoney(total)}</strong></div><Link className="button button--primary checkout-link" to="/checkout">Continue to checkout →</Link><Button variant="secondary" onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear cart</Button></aside></div>}
  </section>
}
