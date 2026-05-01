import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/pages/Dashboard'
import { ProductList } from '@/components/ProductList'
import { OrderList } from '@/components/OrderList'
import './App.css'

export function App() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard')

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="app">
      <div className="sidebar">
        <nav className="nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </nav>
      </div>

      <div className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'orders' && <OrderList />}
      </div>
    </div>
  )
}
