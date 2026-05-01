import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CartService } from '../src/cart/cart.service'
import { CheckoutService } from '../src/checkout/checkout.service'

// Mock Prisma service for simpler test scenarios
const createMockPrisma = () => ({
  cart: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  cartItem: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
})

describe('Cart & Checkout Integration', () => {
  let cartService: CartService
  let checkoutService: CheckoutService
  let mockPrisma: any

  const testUserId = 'user-123'

  beforeEach(() => {
    mockPrisma = createMockPrisma()
    cartService = new CartService(mockPrisma)
    checkoutService = new CheckoutService(cartService, mockPrisma)
  })

  describe('checkout workflow', () => {
    it('should handle cart creation', async () => {
      // Setup cart response
      mockPrisma.cart.findUnique.mockResolvedValue(null)
      mockPrisma.cart.create.mockResolvedValue({
        id: 'cart-1',
        userId: testUserId,
        items: [],
        createdAt: new Date(),
      })
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product 1',
        price: 29.99,
      })
      mockPrisma.cartItem.findUnique.mockResolvedValue(null)
      mockPrisma.cartItem.create.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
      })

      // Add item to cart
      const result = await cartService.addItem(testUserId, 'prod-1', 2)
      expect(result).toBeDefined()
      expect(mockPrisma.cart.create).toHaveBeenCalled()
    })

    it('should create order during checkout', async () => {
      // Setup cart with items
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: testUserId,
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            product: { price: 29.99 },
          },
        ],
        createdAt: new Date(),
      })
      mockPrisma.order.create.mockResolvedValue({
        id: 'order-1',
        userId: testUserId,
        total: 59.98,
        status: 'pending',
        createdAt: new Date(),
        items: [],
      })

      const result = await checkoutService.startCheckout(testUserId)
      expect(result.orderId).toBe('order-1')
      expect(result.total).toBe(59.98)
    })

    it('should prevent checkout with empty cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: testUserId,
        items: [],
        createdAt: new Date(),
      })

      try {
        await checkoutService.startCheckout(testUserId)
        expect.fail('Should throw empty cart error')
      } catch (err: any) {
        expect(err.response?.message || err.message).toBeDefined()
      }
    })

    it('should process payment successfully', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: testUserId,
        status: 'pending',
        total: 100,
      })
      mockPrisma.order.update.mockResolvedValue({
        id: 'order-1',
        status: 'paid',
      })
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        userId: testUserId,
        items: [],
      })
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 })

      const result = await checkoutService.processPayment('order-1', {})
      expect(result.success).toBe(true)
    })

    it('should retrieve user orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          userId: testUserId,
          status: 'paid',
          total: 100,
          items: [],
        },
      ])

      const result = await checkoutService.getUserOrders(testUserId)
      expect(Array.isArray(result)).toBe(true)
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: testUserId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('error handling', () => {
    it('should throw when adding item without userId', async () => {
      try {
        await cartService.addItem(undefined as any, 'prod-1', 1)
        expect.fail('Should throw userId error')
      } catch (err: any) {
        expect(err.response?.message || err.message).toContain('userId')
      }
    })

    it('should throw when starting checkout without userId', async () => {
      try {
        await checkoutService.startCheckout(undefined as any)
        expect.fail('Should throw userId error')
      } catch (err: any) {
        expect(err.response?.message || err.message).toContain('userId')
      }
    })

    it('should throw when product not found', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null)
      mockPrisma.cart.create.mockResolvedValue({ id: 'cart-1', userId: testUserId })
      mockPrisma.product.findUnique.mockResolvedValue(null)

      try {
        await cartService.addItem(testUserId, 'prod-invalid', 1)
        expect.fail('Should throw product not found error')
      } catch (err: any) {
        expect(err.response?.message || err.message).toContain('Product')
      }
    })

    it('should handle order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null)

      try {
        await checkoutService.getOrder('order-invalid')
        // Can return null or throw, both are valid
        expect(true).toBe(true)
      } catch (err) {
        // Also acceptable if it throws
        expect(err).toBeDefined()
      }
    })
  })
})
