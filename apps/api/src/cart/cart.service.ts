export type CartItem = { productId: string; quantity: number; price?: number }
export type Cart = { userId?: string; items: CartItem[]; total?: number; createdAt?: Date }

export class CartService {
  private carts: Cart[] = []
  private productPrices: Map<string, number> = new Map([
    ['prod-1', 29.99],
    ['prod-2', 49.99],
    ['prod-3', 99.99],
  ])

  getCart(userId?: string) {
    const cart = this.carts.find(c => c.userId === userId) ?? { userId, items: [], createdAt: new Date() }
    return { ...cart, total: this.calculateTotal(cart.items) }
  }

  addItem(userId: string | undefined, productId: string, quantity: number) {
    if (!userId) throw new Error('userId required')
    if (quantity <= 0) throw new Error('quantity must be > 0')
    
    let cart = this.carts.find(c => c.userId === userId)
    if (!cart) {
      cart = { userId, items: [], createdAt: new Date() }
      this.carts.push(cart)
    }
    
    const price = this.productPrices.get(productId)
    if (!price) throw new Error(`Product ${productId} not found`)
    
    const idx = cart.items.findIndex(i => i.productId === productId)
    if (idx >= 0) {
      cart.items[idx].quantity += quantity
    } else {
      cart.items.push({ productId, quantity, price })
    }
    
    return { ...cart, total: this.calculateTotal(cart.items) }
  }

  removeItem(userId: string | undefined, productId: string) {
    if (!userId) throw new Error('userId required')
    
    const cart = this.carts.find(c => c.userId === userId)
    if (!cart) throw new Error('Cart not found')
    
    cart.items = cart.items.filter(i => i.productId !== productId)
    return { ...cart, total: this.calculateTotal(cart.items) }
  }

  clearCart(userId: string | undefined) {
    if (!userId) throw new Error('userId required')
    
    const cart = this.carts.find(c => c.userId === userId)
    if (!cart) throw new Error('Cart not found')
    
    cart.items = []
    return { ...cart, total: 0 }
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
  }
}
