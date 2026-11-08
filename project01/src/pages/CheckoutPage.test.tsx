import { act, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '../context/CartContext'
import { useCart } from '../hooks/useCart'
import { productFixture } from '../test/productFixture'
import { CheckoutPage } from './CheckoutPage'

beforeEach(() =>
  localStorage.setItem('shoplite-cart', JSON.stringify([{ product: productFixture, quantity: 1 }])),
)

function renderCheckout() {
  return render(
    <CartProvider>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </CartProvider>,
  )
}

describe('CheckoutPage', () => {
  it('shows errors for an empty submission and focuses the first field', () => {
    renderCheckout()
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }))
    expect(screen.getByText('Enter your full name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-describedby', 'fullName-error')
  })
  it('hides card fields and skips their validation for cash', () => {
    renderCheckout()
    fireEvent.click(screen.getByLabelText('Cash on delivery'))
    expect(screen.queryByLabelText('Card number')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }))
    expect(screen.queryByText(/valid card number/i)).not.toBeInTheDocument()
  })
  it('validates fields on blur', () => {
    renderCheckout()
    fireEvent.blur(screen.getByLabelText('Email'))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })
  it('cancels the order when the customer leaves checkout', () => {
    vi.useFakeTimers()
    try {
      function Shop() {
        const { count } = useCart()
        return <p>{count} item in cart</p>
      }

      render(
        <CartProvider>
          <MemoryRouter initialEntries={['/checkout']}>
            <Link to="/shop">Shop</Link>
            <Routes>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/order/success" element={<p>Order placed</p>} />
            </Routes>
          </MemoryRouter>
        </CartProvider>,
      )

      const validFields = {
        'Full name': 'Jane Doe',
        Email: 'jane@example.com',
        Phone: '1234567890',
        Address: '123 Test Street',
        City: 'Testville',
        'Postal code': '12345',
      }
      Object.entries(validFields).forEach(([label, value]) => {
        fireEvent.change(screen.getByLabelText(label), { target: { value } })
      })
      fireEvent.click(screen.getByLabelText('Cash on delivery'))
      fireEvent.click(screen.getByRole('button', { name: 'Place order' }))
      fireEvent.click(screen.getByRole('link', { name: 'Shop' }))

      act(() => vi.advanceTimersByTime(1000))
      expect(screen.getByText('1 item in cart')).toBeInTheDocument()
      expect(screen.queryByText('Order placed')).not.toBeInTheDocument()
      expect(JSON.parse(localStorage.getItem('shoplite-cart') ?? '[]')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
