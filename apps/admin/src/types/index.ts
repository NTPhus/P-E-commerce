export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
}

export interface CartItem {
  productId: string
  quantity: number
  price?: number
}

export interface Order {
  id: string
  userId: string
  total: number
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  createdAt: string
  paymentMethod?: string
  shippingAddress?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}

export interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Product[]
  recentOrders: Order[]
}
