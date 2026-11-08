import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { productFixture } from '../test/productFixture'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('shows product data and a detail link', () => {
    render(<MemoryRouter><ProductCard product={productFixture} onAdd={vi.fn()} /></MemoryRouter>)
    expect(screen.getByText('Demo Phone')).toBeInTheDocument()
    expect(screen.getByText('$90.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Demo Phone' })).toHaveAttribute('href', '/products/1')
  })
  it('adds the product to the cart', () => {
    const onAdd = vi.fn()
    render(<MemoryRouter><ProductCard product={productFixture} onAdd={onAdd} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Add Demo Phone to cart' }))
    expect(onAdd).toHaveBeenCalledWith(productFixture)
  })
  it('disables adding out-of-stock products', () => {
    render(<MemoryRouter><ProductCard product={{ ...productFixture, stock: 0 }} onAdd={vi.fn()} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Add Demo Phone to cart' })).toBeDisabled()
  })
})
