import React, { useState } from 'react'
import { orderApi } from '@/api/orders'

export default function Checkout() {
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('card')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await orderApi.startCheckout(method, address)
      console.log('Checkout started', res)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Checkout</h2>
        <p>Order placed (mock). We'll redirect to confirmation soon.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Shipping Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ddd' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}>
            <option value="card">Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '10px 16px' }}>Place Order</button>
      </form>
    </div>
  )
}
