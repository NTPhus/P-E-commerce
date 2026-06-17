import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'

describe('Commerce App', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 'cat-1', name: 'Home' }],
        })
      }

      if (String(url).includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{
            id: 'prod-1',
            name: 'Portable Desk Lamp',
            description: 'Rechargeable lamp',
            price: 24.99,
            stock: 4,
            images: [],
            category: { id: 'cat-1', name: 'Home' },
            seller: { id: 'seller-1', name: 'Demo Seller' },
          }],
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    })
  })

  it('renders catalog products from the API', async () => {
    render(<App />)

    expect(await screen.findByText(/Portable Desk Lamp/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add to cart/i })).toBeInTheDocument()
  })
})
