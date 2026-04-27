import { describe, it, expect } from 'vitest'
import { CheckoutService } from '../../src/checkout/checkout.service'

describe('CheckoutService (Phase 2)', () => {
  it('starts a checkout and creates an order', () => {
    const svc = new CheckoutService()
    const res = svc.startCheckout({ cartId: 'cart-1', total: 100 })
    expect(res).toHaveProperty('success', true)
  })
})
