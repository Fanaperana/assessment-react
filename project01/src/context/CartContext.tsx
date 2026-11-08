import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CartContext } from '../hooks/useCart'
import { cartReducer } from '../reducers/cartReducer'
import type { CartItem } from '../reducers/cartReducer'

export function CartProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useLocalStorage<CartItem[]>('shoplite-cart', [])
  const [items, dispatch] = useReducer(cartReducer, saved)
  useEffect(() => setSaved(items), [items, setSaved])
  const count = items.reduce((total, item) => total + item.quantity, 0)
  return <CartContext.Provider value={{ items, dispatch, count }}>{children}</CartContext.Provider>
}
