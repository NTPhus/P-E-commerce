import React from 'react'
import { Product } from '@/types'
import { useCart } from '@/store/cart'

type Props = {
  product: Product
  onAdd?: (p: Product) => void
}

export default function ProductCard({ product, onAdd }: Props) {
  const { add } = useCart()
  const addToCart = () => {
    add(product.id, 1, product.price)
    onAdd?.(product)
  }

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, width: 260 }}>
      <div style={{ height: 150, background: '#f3f3f3', borderRadius: 6 }} />
      <h3 style={{ margin: '8px 0' }}>{product.name}</h3>
      <p style={{ color: '#555' }}>{product.description ?? ''}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>${product.price.toFixed(2)}</strong>
        <button onClick={addToCart} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#1d4ed8', color: 'white' }}>
          Add
        </button>
      </div>
    </div>
  )
}
