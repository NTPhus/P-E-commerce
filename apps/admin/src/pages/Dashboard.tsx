import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import type { Order, DashboardStats } from '@/types'
import './Dashboard.css'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { fetchOrders } = useOrders()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const orders = await fetchOrders()
      
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const recentOrders = orders.slice(0, 5)

      setStats({
        totalUsers: 0,
        totalOrders,
        totalRevenue,
        averageOrderValue: avgOrderValue,
        topProducts: [],
        recentOrders,
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1>E-Commerce Admin Dashboard</h1>
        <div className="navbar-right">
          <span className="user-info">{user?.username}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading dashboard...</div>
      ) : stats ? (
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Average Order Value</h3>
            <p className="stat-value">${stats.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
