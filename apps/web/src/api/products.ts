import apiClient from './client'
import type { Product } from '@/types'

export const productsApi = {
  fetchAll: async (): Promise<Product[]> => {
    const res = await apiClient.get('/catalog/products')
    return res.data
  }
}
