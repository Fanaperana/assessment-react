import { useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from '../hooks/useCart'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cartReducer } from '../reducers/cartReducer'
import type { CartItem } from '../reducers/cartReducer'

export function CartProvider({ children }: { children: ReactNode }) {
  const { read, write } = useLocalStorage<CartItem[] | null>('shoplite-cart', null)
  const [items, dispatch] = useReducer(cartReducer, undefined, () => {
    const saved = read()
    return Array.isArray(saved) ? saved : []
  })
  useEffect(() => write(items), [items, write])
  const count = items.reduce((total, item) => total + item.quantity, 0)
  return <CartContext.Provider value={{ items, dispatch, count }}>{children}</CartContext.Provider>
}
