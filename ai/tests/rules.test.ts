import { describe, it, expect } from 'vitest'
import { decideAgent } from '../rules/engine'

describe('Rules Engine MVP (Phase 0)', () => {
  it('maps actions to agents', () => {
    expect(decideAgent('create_product')).toBe('CatalogAgent')
    expect(decideAgent('add_to_cart')).toBe('CartAgent')
    expect(decideAgent('checkout')).toBe('CheckoutAgent')
  })
})
