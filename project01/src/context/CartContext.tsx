import { createContext, useContext, useEffect, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cartReducer } from '../reducers/cartReducer'
import type { CartAction, CartItem } from '../reducers/cartReducer'

interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useLocalStorage<CartItem[]>('shoplite-cart', [])
  const [items, dispatch] = useReducer(cartReducer, saved)
  useEffect(() => setSaved(items), [items, setSaved])
  const count = items.reduce((total, item) => total + item.quantity, 0)
  return <CartContext.Provider value={{ items, dispatch, count }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
