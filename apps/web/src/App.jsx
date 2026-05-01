import React from 'react'
import Dashboard from './Dashboard.jsx'
import Catalog from './pages/Catalog.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Profile from './pages/Profile.jsx'
import React, { useState } from 'react'

export default function App() {
  const [view, setView] = useState('dashboard')
  const renderView = () => {
    switch (view) {
      case 'catalog': return <Catalog />
      case 'cart': return <Cart />
      case 'checkout': return <Checkout />
      case 'profile': return <Profile />
      default: return <Dashboard />
    }
  }
  return (
    <div className="app" style={{ padding: 20 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setView('dashboard')}>Dashboard</button>
        <button onClick={() => setView('catalog')}>Catalog</button>
        <button onClick={() => setView('cart')}>Cart</button>
        <button onClick={() => setView('checkout')}>Checkout</button>
        <button onClick={() => setView('profile')}>Profile</button>
      </nav>
      {renderView()}
    </div>
  )
}
