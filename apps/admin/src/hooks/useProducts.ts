import { useAuth } from '@/hooks/useAuth'
import type { Product } from '@/types'

export function useProducts() {
  const { token } = useAuth()

  const fetchProducts = async () => {
    const response = await fetch('http://localhost:3000/api/catalog/products', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json() as Promise<Product[]>
  }

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    const response = await fetch(`http://localhost:3000/api/catalog/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Failed to update product')
    return response.json() as Promise<Product>
  }

  const createProduct = async (data: Omit<Product, 'id'>) => {
    const response = await fetch('http://localhost:3000/api/catalog/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error('Failed to create product')
    return response.json() as Promise<Product>
  }

  return { fetchProducts, updateProduct, createProduct }
}
