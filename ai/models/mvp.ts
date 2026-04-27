// MVP data models (Phase 0)
export interface Product {
  id: string
  name: string
  price: number
  inventory?: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
}

export interface Order {
  id: string
  cartId: string
  total: number
  status: string
}

export interface User {
  id: string
  name?: string
  email?: string
}

export interface Inventory {
  productId: string
  quantity: number
}
