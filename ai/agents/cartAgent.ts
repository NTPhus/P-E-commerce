// CartAgent MVP stub
export async function CartAgent(payload: { taskId: string; action: string; data?: any }): Promise<any> {
  switch (payload.action) {
    case 'add_to_cart':
      return { success: true, result: { cartId: 'cart-001', items: payload.data?.items ?? [] } }
    case 'remove_from_cart':
    case 'update_quantity':
      return { success: true, result: { ok: true, payload: payload.data } }
    default:
      return { success: false, error: 'unsupported action' }
  }
}

export default CartAgent
