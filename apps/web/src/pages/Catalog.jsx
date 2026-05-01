import React from 'react'

export default function Catalog() {
  const products = [
    { id: 'p1', name: 'Sample Product 1', description: 'Desc 1', price: 9.99, category: 'General' },
    { id: 'p2', name: 'Sample Product 2', description: 'Desc 2', price: 19.99, category: 'Electronics' },
  ]
  const card = (p) => (
    <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, width: 260 }}>
      <div style={{ height: 120, background: '#f6f6f6', borderRadius: 4 }} />
      <h3 style={{ margin: '8px 0' }}>{p.name}</h3>
      <div style={{ color: '#555' }}>{p.description}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <strong>${p.price.toFixed(2)}</strong>
        <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#2563eb', color: 'white' }}>Add</button>
      </div>
    </div>
  )
  return (
    <div style={{ padding: 20 }}>
      <h2>Catalog</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {products.map((p) => card(p))}
      </div>
    </div>
  )
}
