import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '../components/Button'
import { useCart } from '../hooks/useCart'
import { discountedPrice, formatMoney } from '../utils/money'
import { initialCheckoutValues, validateCheckout } from '../utils/checkout'
import type { CheckoutErrors, CheckoutField, CheckoutValues } from '../utils/checkout'

const fields: { key: Exclude<CheckoutField, 'paymentMethod'>; label: string; type?: string; autoComplete?: string }[] = [
  { key: 'fullName', label: 'Full name', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { key: 'address', label: 'Address', autoComplete: 'street-address' },
  { key: 'city', label: 'City', autoComplete: 'address-level2' },
  { key: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { key: 'cardNumber', label: 'Card number', autoComplete: 'cc-number' },
  { key: 'expiry', label: 'Expiry (MM/YY)', autoComplete: 'cc-exp' },
  { key: 'cvc', label: 'CVC', autoComplete: 'cc-csc' },
]

export function CheckoutPage() {
  const { items, dispatch } = useCart()
  const navigate = useNavigate()
  const [values, setValues] = useState<CheckoutValues>(initialCheckoutValues)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const total = items.reduce((sum, item) => sum + discountedPrice(item.product.price, item.product.discountPercentage) * item.quantity, 0)
  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
    if (name === 'paymentMethod') setErrors(current => ({ ...current, cardNumber: undefined, expiry: undefined, cvc: undefined }))
  }
  function handleBlur(event: ChangeEvent<HTMLInputElement>) {
    const key = event.target.name as CheckoutField
    setErrors(current => ({ ...current, [key]: validateCheckout(values)[key] }))
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateCheckout(values)
    setErrors(nextErrors)
    const first = fields.find(field => nextErrors[field.key])
    if (first) {
      form.current?.querySelector<HTMLInputElement>(`[name="${first.key}"]`)?.focus()
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}`
      dispatch({ type: 'CLEAR_CART' })
      navigate(`/order/success?number=${encodeURIComponent(orderNumber)}`, { replace: true })
    }, 1000)
  }

  const renderField = (field: typeof fields[number]) => <div className="form-field" key={field.key}><label htmlFor={field.key}>{field.label}</label><input id={field.key} name={field.key} type={field.type ?? 'text'} autoComplete={field.autoComplete} inputMode={field.key === 'cardNumber' || field.key === 'cvc' ? 'numeric' : undefined} value={values[field.key]} onChange={updateField} onBlur={handleBlur} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} disabled={submitting} />{errors[field.key] && <span className="field-error" id={`${field.key}-error`}>{errors[field.key]}</span>}</div>

  return <section className="checkout-page"><div className="section-heading"><div><span className="eyebrow">ONE LAST STEP</span><h1>Checkout</h1></div></div><div className="checkout-layout"><form ref={form} onSubmit={submit} noValidate><h2>Contact & delivery</h2><div className="form-grid">{fields.slice(0, 6).map(renderField)}</div><fieldset><legend>Payment method</legend><label className="radio-option"><input type="radio" name="paymentMethod" value="card" checked={values.paymentMethod === 'card'} onChange={updateField} disabled={submitting} /> Card</label><label className="radio-option"><input type="radio" name="paymentMethod" value="cash" checked={values.paymentMethod === 'cash'} onChange={updateField} disabled={submitting} /> Cash on delivery</label></fieldset>{values.paymentMethod === 'card' && <><h2>Card details</h2><p className="muted">Demo only. Use fake test values; nothing is sent to a server.</p><div className="form-grid">{fields.slice(6).map(renderField)}</div></>}<Button type="submit" disabled={submitting}>{submitting ? 'Placing order…' : 'Place order'}</Button></form><aside className="order-summary"><h2>Your order</h2>{items.map(item => <div key={item.product.id}><span>{item.product.title} × {item.quantity}</span><span>{formatMoney(discountedPrice(item.product.price, item.product.discountPercentage) * item.quantity)}</span></div>)}<div className="summary-total"><strong>Total</strong><strong>{formatMoney(total)}</strong></div></aside></div></section>
}
