import { useAuth } from '@/hooks/useAuth'
import type { Order } from '@/types'

export function useOrders() {
  const { token } = useAuth()

  const fetchOrders = async (userId?: string) => {
    const url = userId 
      ? `http://localhost:3000/api/checkout/orders?userId=${userId}`
      : 'http://localhost:3000/api/checkout/orders'

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch orders')
    return response.json() as Promise<Order[]>
  }

  const getOrder = async (orderId: string) => {
    const response = await fetch(`http://localhost:3000/api/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch order')
    return response.json() as Promise<Order>
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await fetch(`http://localhost:3000/api/checkout/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) throw new Error('Failed to update order')
    return response.json() as Promise<Order>
  }

  return { fetchOrders, getOrder, updateOrderStatus }
}
