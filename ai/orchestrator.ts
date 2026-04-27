import { createInitialWorld, WorldState } from './memory/world'
import Planner from './planner/core'
import CatalogAgent from './agents/catalogAgent'
import CartAgent from './agents/cartAgent'
import CheckoutAgent from './agents/checkoutAgent'

// Aggregate agents map for dynamic dispatch
const agentParsers: any = {
  CatalogAgent,
  CartAgent,
  CheckoutAgent
}

export async function runPhase0Task(input: { id: string; action: string; data?: any }, initial?: WorldState) {
  const world: WorldState = initial ?? createInitialWorld()
  // Plan task
  const planned = Planner.planTask(input as any, world)
  // Execute using agent mapping
  const res = await Planner.executePlanned(input as any, world, agentParsers)
  return { planned, executed: res, world }
}

export default {
  runPhase0Task
}
