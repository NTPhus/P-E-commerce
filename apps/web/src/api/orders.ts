import apiClient from '@/api/client'

export const orderApi = {
  startCheckout: async (paymentMethod?: string, shippingAddress?: string) => {
    const { data } = await apiClient.post('/checkout/orders', {
      paymentMethod,
      shippingAddress,
    })
    return data
  },

  processPayment: async (orderId: string, paymentInfo: any) => {
    const { data } = await apiClient.post(`/checkout/orders/${orderId}/payment`, paymentInfo)
    return data
  },

  getOrder: async (orderId: string) => {
    const { data } = await apiClient.get(`/checkout/orders/${orderId}`)
    return data
  },

  getUserOrders: async () => {
    const { data } = await apiClient.get('/checkout/orders')
    return data
  },

  completeOrder: async (orderId: string) => {
    const { data } = await apiClient.post(`/checkout/orders/${orderId}/complete`)
    return data
  },
}
