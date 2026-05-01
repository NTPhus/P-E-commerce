import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'

function Nav() {
  return (
    <nav style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link>
      <Link to="/catalog">Catalog</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/checkout">Checkout</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}
