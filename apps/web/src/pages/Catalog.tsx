import React, { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { productsApi } from '@/api/products'
import type { Product } from '@/types'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.fetchAll()
        setProducts(data)
      } catch {
        // fallback to local mock data if API not ready
        const mock: Product[] = [
          { id: 'p1', name: 'Sample Product 1', description: 'Desc 1', price: 9.99, stock: 100 },
          { id: 'p2', name: 'Sample Product 2', description: 'Desc 2', price: 19.99, stock: 50 },
        ]
        setProducts(mock)
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Catalog</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
