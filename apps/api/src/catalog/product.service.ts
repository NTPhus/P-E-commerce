type Product = { id: string; name: string; price: number; inventory?: number }

export class ProductService {
  private products: Product[] = []

  findAll(): Product[] {
    return this.products
  }

  create(p: { name: string; price: number; inventory?: number }): Product {
    const prod = { id: 'prod-' + (this.products.length + 1), name: p.name, price: p.price, inventory: p.inventory ?? 0 }
    this.products.push(prod)
    return prod
  }
}
