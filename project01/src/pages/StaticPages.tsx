import { Link, useSearchParams } from 'react-router'
import { EmptyState } from '../components/Feedback'

export function OrderSuccessPage() {
  const [params] = useSearchParams()
  const number = params.get('number')
  return <section className="success-page"><span className="success-icon" aria-hidden="true">✓</span><span className="eyebrow">ORDER CONFIRMED</span><h1>Thank you for your order!</h1><p>{number ? <>Your order number is <strong>{number}</strong>.</> : 'Your order is complete.'}</p><p className="muted">This is a demo purchase. No payment or personal details were sent anywhere.</p><Link className="button button--primary" to="/">Continue shopping</Link></section>
}

export function NotFoundPage() {
  return <EmptyState title="404 · Page not found"><p>We couldn’t find that page.</p><Link className="button button--primary" to="/">Back to shop</Link></EmptyState>
}
