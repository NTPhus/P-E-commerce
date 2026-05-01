import React from 'react'

import React from 'react'
import { useCart } from '@/store/cart'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { cart } = useCart()
  const navigate = useNavigate()
  const total = cart.items.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0)
  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      <div>
        {cart.items.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          cart.items.map((it) => (
            <div key={it.productId}>
              <span>{it.productId}</span> - <span>Qty {it.quantity}</span> - <span>${(it.price || 0).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
      <hr />
      <div style={{ fontWeight: 600 }}>Total: ${total.toFixed(2)}</div>
      <button onClick={() => navigate('/checkout')} style={{ marginTop: 12, padding: '8px 12px' }}>Checkout</button>
    </div>
  )
}
