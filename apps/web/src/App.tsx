import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Login from './pages/Login'
import { Navigate } from 'react-router-dom'

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
  // Redirect authenticated users away from login page
  // @ts-ignore
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('authToken')
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {!isAuth && <Route path="/login" element={<Login />} />}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
