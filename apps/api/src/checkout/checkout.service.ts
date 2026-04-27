import { CartService, CartItem } from '../cart/cart.service'

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled'
export type Order = { 
  id: string
  userId: string
  cartItems: CartItem[]
  total: number
  status: OrderStatus
  createdAt: Date
  paymentMethod?: string
  shippingAddress?: string
}

export class CheckoutService {
  private orders: Order[] = []

  constructor(private cartService: CartService) {}

  startCheckout(userId: string, paymentMethod?: string, shippingAddress?: string): { orderId: string; total: number } {
    if (!userId) throw new Error('userId required')

    const cart = this.cartService.getCart(userId)
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    const orderId = 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const total = cart.total || 0

    const order: Order = {
      id: orderId,
      userId,
      cartItems: cart.items,
      total,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      shippingAddress,
    }

    this.orders.push(order)

    return { orderId, total }
  }

  processPayment(orderId: string, paymentInfo: any): { success: boolean; orderId: string; status: OrderStatus } {
    const order = this.orders.find(o => o.id === orderId)
    if (!order) throw new Error(`Order ${orderId} not found`)
    if (order.status !== 'pending') throw new Error(`Order ${orderId} already processed`)

    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1 // 90% success rate for demo

    if (paymentSuccess) {
      order.status = 'paid'
      // Clear cart after successful payment
      this.cartService.clearCart(order.userId)
      return { success: true, orderId, status: 'paid' }
    } else {
      order.status = 'cancelled'
      return { success: false, orderId, status: 'cancelled' }
    }
  }

  getOrder(orderId: string): Order | null {
    return this.orders.find(o => o.id === orderId) || null
  }

  getUserOrders(userId: string): Order[] {
    return this.orders.filter(o => o.userId === userId)
  }

  completeOrder(orderId: string): { success: boolean; order: Order } {
    const order = this.orders.find(o => o.id === orderId)
    if (!order) throw new Error(`Order ${orderId} not found`)
    if (order.status !== 'paid') throw new Error('Order must be paid before completion')

    order.status = 'completed'
    return { success: true, order }
  }
}
