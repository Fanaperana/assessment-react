import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { CartAction, CartItem } from '../reducers/cartReducer'

export interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
  count: number
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
