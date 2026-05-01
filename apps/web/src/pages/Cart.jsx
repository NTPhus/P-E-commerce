import React from 'react'

export default function Cart() {
  const items = [
    { id: 'p1', name: 'Sample Product 1', qty: 2, price: 9.99 },
    { id: 'p2', name: 'Sample Product 2', qty: 1, price: 19.99 },
  ]
  const total = items.reduce((s, it) => s + it.price * it.qty, 0)
  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div>
          {items.map((it) => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>{it.name} x {it.qty}</span>
              <span>${(it.price * it.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div style={{ fontWeight: 700, marginTop: 8 }}>Total: ${total.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
