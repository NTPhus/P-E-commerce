import React, { useEffect, useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import type { Order } from '@/types'
import './OrderList.css'

export function OrderList() {
  const { fetchOrders, updateOrderStatus } = useOrders()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const data = await fetchOrders()
      setOrders(data)
      const statuses: Record<string, string> = {}
      data.forEach(order => {
        statuses[order.id] = order.status
      })
      setSelectedStatus(statuses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setSelectedStatus(prev => ({ ...prev, [orderId]: newStatus }))
      await loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status')
    }
  }

  if (isLoading) return <div className="loading">Loading orders...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="order-list">
      <h2>Recent Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userId}</td>
              <td>${order.total.toFixed(2)}</td>
              <td>
                <select
                  value={selectedStatus[order.id] || order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`status-${order.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{order.items?.length || 0} items</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
