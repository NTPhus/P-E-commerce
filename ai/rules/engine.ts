// Phase 0 MVP: simple rule engine to map actions to agents
export function decideAgent(action: string): string {
  switch (action) {
    case 'create_product':
      return 'CatalogAgent'
    case 'add_to_cart':
      return 'CartAgent'
    case 'checkout':
      return 'CheckoutAgent'
    default:
      return 'CatalogAgent'
  }
}
