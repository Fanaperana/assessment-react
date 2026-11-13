import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from '../context/CartContext'
import { productFixture } from '../test/productFixture'
import { CartPage } from './CartPage'

beforeEach(() =>
  localStorage.setItem('shoplite-cart', JSON.stringify([{ product: productFixture, quantity: 2 }])),
)
afterEach(() => localStorage.clear())

describe('CartPage', () => {
  it('lets the customer clear and replace a quantity before clamping it on blur', () => {
    render(
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>,
    )
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    fireEvent.change(input, { target: { value: '' } })
    expect(input.value).toBe('')
    fireEvent.change(input, { target: { value: '4' } })
    fireEvent.blur(input)
    expect(input.value).toBe('4')
    expect(JSON.parse(localStorage.getItem('shoplite-cart') ?? '[]')[0].quantity).toBe(4)

    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.blur(input)
    expect(input.value).toBe('5')
  })
})
