import React from 'react'

import React from 'react'
import { useCart } from '@/store/cart'

export default function Cart() {
  const { cart } = useCart()
  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      <div>
        {cart.items.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          cart.items.map((it) => (
            <div key={it.productId}>
              <span>{it.productId}</span> - <span>Qty {it.quantity}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
