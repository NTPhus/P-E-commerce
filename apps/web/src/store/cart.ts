import { create } from 'zustand'
import type { Cart } from '@/types'

interface CartState {
  cart: Cart
  add: (productId: string, quantity: number, price: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  cart: { items: [], total: 0 },
  add: (id, q, price) => set((s) => ({ cart: { items: [...s.cart.items, { productId: id, quantity: q, price }] , total: s.cart.total } })),
  clear: () => set({ cart: { items: [], total: 0 } }),
}))
