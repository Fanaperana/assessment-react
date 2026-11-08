import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from '../context/CartContext'
import { productFixture } from '../test/productFixture'
import { CheckoutPage } from './CheckoutPage'

beforeEach(() => localStorage.setItem('shoplite-cart', JSON.stringify([{ product: productFixture, quantity: 1 }])))

function renderCheckout() {
  return render(<CartProvider><MemoryRouter><CheckoutPage /></MemoryRouter></CartProvider>)
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
})
