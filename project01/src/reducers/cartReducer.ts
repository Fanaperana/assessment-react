import type { Product } from '../types/product'

export interface CartItem {
  product: Product
  quantity: number
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'UPDATE_QUANTITY'; id: number; quantity: number }
  | { type: 'CLEAR_CART' }

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantity = Math.min(action.product.stock, Math.max(1, Math.trunc(action.quantity)))
      if (quantity < 1) return state
      const existing = state.find((item) => item.product.id === action.product.id)
      return existing
        ? state.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: Math.min(item.product.stock, item.quantity + quantity) }
              : item,
          )
        : [...state, { product: action.product, quantity }]
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.product.id !== action.id)
    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.product.id === action.id
          ? {
              ...item,
              quantity: Math.min(item.product.stock, Math.max(1, Math.trunc(action.quantity))),
            }
          : item,
      )
    case 'CLEAR_CART':
      return []
  }
}
