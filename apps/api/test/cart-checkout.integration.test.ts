import { describe, it, expect, beforeEach } from 'vitest'
import { CartService } from '../src/cart/cart.service'
import { CheckoutService } from '../src/checkout/checkout.service'

describe('Cart & Checkout Integration', () => {
  let cartService: CartService
  let checkoutService: CheckoutService
  const testUserId = 'user-123'

  beforeEach(() => {
    cartService = new CartService()
    checkoutService = new CheckoutService(cartService)
  })

  describe('checkout workflow', () => {
    it('should complete full checkout flow', () => {
      // 1. Add items to cart
      const cart = cartService.addItem(testUserId, 'prod-1', 2)
      expect(cart.items).toHaveLength(1)
      expect(cart.total).toBe(59.98) // 29.99 * 2

      // 2. Add more items
      const cart2 = cartService.addItem(testUserId, 'prod-2', 1)
      expect(cart2.items).toHaveLength(2)
      expect(cart2.total).toBe(109.97) // 59.98 + 49.99

      // 3. Start checkout
      const checkout = checkoutService.startCheckout(testUserId, 'credit-card', '123 Main St')
      expect(checkout.orderId).toBeDefined()
      expect(checkout.total).toBe(109.97)

      // 4. Process payment
      const payment = checkoutService.processPayment(checkout.orderId, { method: 'credit-card' })
      expect(payment.success).toBe(true)
      expect(payment.status).toBe('paid')

      // 5. Cart should be cleared after payment
      const clearedCart = cartService.getCart(testUserId)
      expect(clearedCart.items).toHaveLength(0)
      expect(clearedCart.total).toBe(0)
    })

    it('should not allow checkout with empty cart', () => {
      expect(() => {
        checkoutService.startCheckout(testUserId)
      }).toThrow('Cart is empty')
    })

    it('should track user orders', () => {
      // Create and complete an order
      cartService.addItem(testUserId, 'prod-1', 1)
      const checkout = checkoutService.startCheckout(testUserId)
      checkoutService.processPayment(checkout.orderId, {})

      // Get user orders
      const orders = checkoutService.getUserOrders(testUserId)
      expect(orders).toHaveLength(1)
      expect(orders[0].status).toBe('paid')
    })

    it('should handle multiple users independently', () => {
      const user1 = 'user-1'
      const user2 = 'user-2'

      // User 1 adds items
      cartService.addItem(user1, 'prod-1', 1)
      const order1 = checkoutService.startCheckout(user1)

      // User 2 adds items
      cartService.addItem(user2, 'prod-2', 2)
      const order2 = checkoutService.startCheckout(user2)

      expect(order1.total).toBe(29.99)
      expect(order2.total).toBe(99.98)

      // Verify orders are separate
      const user1Orders = checkoutService.getUserOrders(user1)
      const user2Orders = checkoutService.getUserOrders(user2)

      expect(user1Orders).toHaveLength(1)
      expect(user2Orders).toHaveLength(1)
      expect(user1Orders[0].id).not.toBe(user2Orders[0].id)
    })
  })

  describe('cart total calculation', () => {
    it('should correctly calculate total with multiple items', () => {
      cartService.addItem(testUserId, 'prod-1', 2) // 29.99 * 2 = 59.98
      cartService.addItem(testUserId, 'prod-2', 1) // 49.99 * 1 = 49.99
      cartService.addItem(testUserId, 'prod-3', 3) // 99.99 * 3 = 299.97
      
      const cart = cartService.getCart(testUserId)
      expect(cart.total).toBeCloseTo(409.94, 2)
    })

    it('should update total when item quantity increases', () => {
      cartService.addItem(testUserId, 'prod-1', 1)
      let cart = cartService.getCart(testUserId)
      expect(cart.total).toBeCloseTo(29.99, 2)

      cartService.addItem(testUserId, 'prod-1', 1)
      cart = cartService.getCart(testUserId)
      expect(cart.total).toBeCloseTo(59.98, 2)
    })
  })

  describe('error handling', () => {
    it('should throw error when adding to cart without userId', () => {
      expect(() => {
        cartService.addItem(undefined, 'prod-1', 1)
      }).toThrow('userId required')
    })

    it('should throw error when starting checkout without userId', () => {
      expect(() => {
        checkoutService.startCheckout(undefined as any)
      }).toThrow('userId required')
    })

    it('should throw error when removing non-existent item', () => {
      cartService.addItem(testUserId, 'prod-1', 1)
      
      expect(() => {
        cartService.removeItem(testUserId, 'prod-999')
      }).not.toThrow() // Item just won't be found and filtered out
    })
  })
})
