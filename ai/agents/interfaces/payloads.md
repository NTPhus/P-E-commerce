Payload Contracts (Phase 0 MVP)

- TaskInput: { taskId: string, action: string, data?: any }
- TaskOutput: { taskId: string, success: boolean, result?: any, error?: string }
- CatalogAgentInput = TaskInput with action = 'create_product' | 'update_product' | 'delete_product'
- CartAgentInput = TaskInput with action = 'add_to_cart' | 'remove_from_cart' | 'update_quantity'
- CheckoutAgentInput = TaskInput with action = 'start_checkout' | 'payment_approved' | 'checkout_complete'

Notes:
- These contracts are intentionally light; Phase 1 will extend with strict schemas (e.g., Zod) and typed DTOs.
