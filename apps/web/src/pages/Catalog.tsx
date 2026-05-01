import React, { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { productsApi } from '@/api/products'
import type { Product } from '@/types'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('')

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

  const categories = Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)))
  const filtered = products.filter((p) => {
    const byQuery = (p.name + ' ' + (p.description ?? '')).toLowerCase().includes(query.toLowerCase())
    const byCat = category ? (p.category ?? '') === category : true
    return byQuery && byCat
  })

  return (
    <div style={{ padding: 20 }}>
      <h2>Catalog</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={() => { setQuery(''); setCategory('') }} style={{ padding: '8px 12px' }}>Clear</button>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
