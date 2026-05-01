import React, { useEffect, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/types'
import './ProductList.css'

export function ProductList() {
  const { fetchProducts, updateProduct } = useProducts()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues(product)
  }

  const handleSave = async (id: string) => {
    try {
      const updated = await updateProduct(id, editValues)
      setProducts(products.map(p => (p.id === id ? updated : p)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
    }
  }

  if (isLoading) return <div className="loading">Loading products...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="product-list">
      <h2>Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                {editingId === product.id ? (
                  <input
                    value={editValues.name || ''}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
                    }
                  />
                ) : (
                  product.name
                )}
              </td>
              <td>
                {editingId === product.id ? (
                  <input
                    value={editValues.description || ''}
                    onChange={(e) =>
                      setEditValues({ ...editValues, description: e.target.value })
                    }
                  />
                ) : (
                  product.description
                )}
              </td>
              <td>
                {editingId === product.id ? (
                  <input
                    type="number"
                    value={editValues.price || 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, price: Number(e.target.value) })
                    }
                  />
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </td>
              <td>
                {editingId === product.id ? (
                  <input
                    type="number"
                    value={editValues.stock || 0}
                    onChange={(e) =>
                      setEditValues({ ...editValues, stock: Number(e.target.value) })
                    }
                  />
                ) : (
                  product.stock
                )}
              </td>
              <td className="actions">
                {editingId === product.id ? (
                  <>
                    <button
                      className="btn-save"
                      onClick={() => handleSave(product.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
