import { describe, it, expect } from 'vitest'
import { ProductService } from '../../src/catalog/product.service'

describe('CatalogService (Phase 2)', () => {
  it('creates and lists products', () => {
    const svc = new ProductService()
    const prod = svc.create({ name: 'Phase2 Product', price: 29.99 })
    expect(prod).toHaveProperty('id')
    const list = svc.findAll()
    expect(list.length).toBeGreaterThan(0)
  })
})
