import { describe, it, expect } from 'vitest'
import { CartService } from '../../src/cart/cart.service'

describe('CartService (Phase 2)', () => {
  it('adds item to cart', () => {
    const svc = new CartService()
    svc.addItem('u1', 'p-1', 2)
    const cart = svc.getCart('u1')
    expect(cart.items.length).toBe(1)
    expect(cart.items[0].quantity).toBe(2)
  })
})
