import { describe, it, expect } from 'vitest'
import { createInitialWorld } from '../memory/world'
import { planTask, executePlanned } from '../planner/core'
import { CatalogAgent } from '../agents/catalogAgent'
import { CartAgent } from '../agents/cartAgent'
import { CheckoutAgent } from '../agents/checkoutAgent'

describe('Planner & Agents (Phase 0)', () => {
  it('plans and executes a create_product task using CatalogAgent', async () => {
    const world = createInitialWorld()
    const input = { id: 'T0.100', action: 'create_product', data: { name: 'Demo', price: 1.0 } }
    planTask(input as any, world)
    const res = await executePlanned(input as any, world, {
      CatalogAgent,
      CartAgent,
      CheckoutAgent
    })
    expect(res).toBeDefined()
  })
})
