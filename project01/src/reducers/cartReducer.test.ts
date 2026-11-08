import { describe, expect, it } from 'vitest'
import { productFixture } from '../test/productFixture'
import { cartReducer } from './cartReducer'

const item = { product: productFixture, quantity: 2 }

describe('cartReducer', () => {
  it('adds an item', () =>
    expect(cartReducer([], { type: 'ADD_ITEM', product: productFixture, quantity: 2 })).toEqual([
      item,
    ]))
  it('combines the quantity of an existing item', () =>
    expect(
      cartReducer([item], { type: 'ADD_ITEM', product: productFixture, quantity: 1 })[0].quantity,
    ).toBe(3))
  it('caps additions at available stock', () =>
    expect(
      cartReducer([item], { type: 'ADD_ITEM', product: productFixture, quantity: 20 })[0].quantity,
    ).toBe(5))
  it('does not add an out-of-stock item', () =>
    expect(
      cartReducer([], { type: 'ADD_ITEM', product: { ...productFixture, stock: 0 }, quantity: 1 }),
    ).toEqual([]))
  it('removes an item', () =>
    expect(cartReducer([item], { type: 'REMOVE_ITEM', id: 1 })).toEqual([]))
  it('changes quantity', () =>
    expect(cartReducer([item], { type: 'UPDATE_QUANTITY', id: 1, quantity: 4 })[0].quantity).toBe(
      4,
    ))
  it('keeps quantity within 1 and stock', () => {
    expect(cartReducer([item], { type: 'UPDATE_QUANTITY', id: 1, quantity: 0 })[0].quantity).toBe(1)
    expect(cartReducer([item], { type: 'UPDATE_QUANTITY', id: 1, quantity: 99 })[0].quantity).toBe(
      5,
    )
  })
  it('clears the cart', () => expect(cartReducer([item], { type: 'CLEAR_CART' })).toEqual([]))
  it('does not mutate the previous state', () => {
    const original = [item]
    cartReducer(original, { type: 'UPDATE_QUANTITY', id: 1, quantity: 4 })
    expect(original[0].quantity).toBe(2)
  })
})
