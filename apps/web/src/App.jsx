import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'
const SESSION_KEY = 'commerce-core-session'

async function apiFetch(path, options = {}, token) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const data = await response.json()
      message = data.message || data.error || message
    } catch {}
    throw new Error(message)
  }

  return response.json()
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export default function App() {
  const [session, setSession] = useState(() => loadSession())
  const [view, setView] = useState('catalog')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])
  const [sellerProducts, setSellerProducts] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const token = session?.token
  const user = session?.user

  useEffect(() => {
    loadCatalog()
  }, [selectedCategory])

  useEffect(() => {
    if (!token) {
      setCart(null)
      setOrders([])
      setSellerProducts([])
      return
    }

    refreshSessionData(session)
  }, [token])

  async function runAction(fn, successMessage) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
      if (successMessage) setNotice(successMessage)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function loadCatalog() {
    try {
      const [categoryData, productData] = await Promise.all([
        apiFetch('/categories'),
        apiFetch(`/products${selectedCategory ? `?categoryId=${selectedCategory}` : ''}`),
      ])
      setCategories(categoryData)
      setProducts(productData)
      if (selectedProduct) {
        const latest = productData.find((item) => item.id === selectedProduct.id)
        setSelectedProduct(latest || null)
      }
    } catch (err) {
      setError(err.message || 'Unable to load catalog')
    }
  }

  async function refreshSessionData(activeSession = session) {
    if (!activeSession?.token) return

    try {
      const profile = await apiFetch('/auth/me', {}, activeSession.token)
      const nextSession = { ...activeSession, user: profile }
      setSession(nextSession)
      saveSession(nextSession)

      if (profile.role === 'BUYER') {
        const [cartData, orderData] = await Promise.all([
          apiFetch('/cart', {}, activeSession.token),
          apiFetch('/orders', {}, activeSession.token),
        ])
        setCart(cartData)
        setOrders(orderData)
      }

      if (profile.role === 'SELLER') {
        const productsData = await apiFetch('/seller/products', {}, activeSession.token)
        setSellerProducts(productsData)
      }
    } catch (err) {
      setError(err.message || 'Unable to refresh session')
    }
  }

  async function handleAuth(mode, payload) {
    await runAction(async () => {
      const response = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSession(response)
      saveSession(response)
      setView(response.user.role === 'SELLER' ? 'seller' : 'catalog')
      await refreshSessionData(response)
    }, mode === 'login' ? 'Logged in' : 'Account created')
  }

  function logout() {
    setSession(null)
    saveSession(null)
    setView('catalog')
    setNotice('Logged out')
    setError('')
  }

  async function addToCart(productId) {
    if (!token || user?.role !== 'BUYER') {
      setView('auth')
      setError('Login as buyer to add items to cart')
      return
    }

    await runAction(async () => {
      const nextCart = await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
      }, token)
      setCart(nextCart)
    }, 'Added to cart')
  }

  async function updateCartItem(productId, quantity) {
    await runAction(async () => {
      const nextCart = await apiFetch(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }, token)
      setCart(nextCart)
    }, 'Cart updated')
  }

  async function removeCartItem(productId) {
    await runAction(async () => {
      const nextCart = await apiFetch(`/cart/items/${productId}`, {
        method: 'DELETE',
      }, token)
      setCart(nextCart)
    }, 'Item removed')
  }

  async function submitCheckout(address) {
    await runAction(async () => {
      const order = await apiFetch('/checkout', {
        method: 'POST',
        body: JSON.stringify({ address }),
      }, token)
      setOrders((prev) => [order, ...prev])
      setCart((prev) => ({ ...(prev || {}), items: [], totalAmount: 0, totalItems: 0 }))
      await loadCatalog()
      setView('orders')
    }, 'Order placed successfully')
  }

  async function saveProduct(payload, editingId) {
    await runAction(async () => {
      const method = editingId ? 'PATCH' : 'POST'
      const path = editingId ? `/seller/products/${editingId}` : '/seller/products'
      await apiFetch(path, {
        method,
        body: JSON.stringify(payload),
      }, token)
      const nextProducts = await apiFetch('/seller/products', {}, token)
      setSellerProducts(nextProducts)
      await loadCatalog()
    }, editingId ? 'Product updated' : 'Product created')
  }

  async function archiveProduct(productId) {
    await runAction(async () => {
      await apiFetch(`/seller/products/${productId}`, {
        method: 'DELETE',
      }, token)
      const nextProducts = await apiFetch('/seller/products', {}, token)
      setSellerProducts(nextProducts)
      await loadCatalog()
    }, 'Product archived')
  }

  const heroStats = useMemo(() => ([
    { label: 'Products', value: products.length },
    { label: 'Categories', value: categories.length },
    { label: 'Cart items', value: cart?.totalItems || 0 },
  ]), [products.length, categories.length, cart?.totalItems])

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">Commerce Core MVP</div>
          <h1>P-E-commerce Buyer + Seller Workspace</h1>
          <p>Catalog, cart, checkout COD, seller product management, and order history wired to the API.</p>
        </div>
        <div className="heroStats">
          {heroStats.map((item) => (
            <div key={item.label} className="statCard">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <nav className="topbar">
        <div className="navGroup">
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => setView('catalog')}>Catalog</button>
          <button className={view === 'cart' ? 'active' : ''} onClick={() => setView('cart')}>Cart</button>
          <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')}>Orders</button>
          {user?.role === 'SELLER' ? (
            <button className={view === 'seller' ? 'active' : ''} onClick={() => setView('seller')}>Seller</button>
          ) : null}
        </div>
        <div className="navGroup">
          {user ? (
            <>
              <span className="pill">{user.name} · {user.role}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button className={view === 'auth' ? 'active' : ''} onClick={() => setView('auth')}>Login / Register</button>
          )}
        </div>
      </nav>

      {notice ? <div className="banner success">{notice}</div> : null}
      {error ? <div className="banner error">{error}</div> : null}

      <main className="layout">
        <section className="primaryPanel">
          {view === 'catalog' ? (
            <CatalogView
              categories={categories}
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectProduct={setSelectedProduct}
              onAddToCart={addToCart}
              user={user}
              busy={busy}
            />
          ) : null}

          {view === 'cart' ? (
            <CartView
              cart={cart}
              busy={busy}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeCartItem}
              onSubmitCheckout={submitCheckout}
            />
          ) : null}

          {view === 'orders' ? <OrdersView orders={orders} /> : null}

          {view === 'seller' ? (
            <SellerView
              token={token}
              products={sellerProducts}
              categories={categories}
              busy={busy}
              onSave={saveProduct}
              onArchive={archiveProduct}
            />
          ) : null}

          {view === 'auth' ? (
            <AuthView busy={busy} onSubmit={handleAuth} />
          ) : null}
        </section>

        <aside className="secondaryPanel">
          <ProductSpotlight product={selectedProduct} onAddToCart={addToCart} user={user} busy={busy} />
          <InfoPanel user={user} cart={cart} />
        </aside>
      </main>
    </div>
  )
}

function CatalogView({ categories, products, selectedCategory, onSelectCategory, onSelectProduct, onAddToCart, user, busy }) {
  return (
    <div className="stack">
      <div className="sectionHead">
        <div>
          <h2>Catalog</h2>
          <p>Browse active products from sellers. Filter by category and add items directly to the cart.</p>
        </div>
      </div>

      <div className="chipRow">
        <button className={!selectedCategory ? 'chip active' : 'chip'} onClick={() => onSelectCategory('')}>All</button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={selectedCategory === category.id ? 'chip active' : 'chip'}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="productGrid">
        {products.map((product) => (
          <article key={product.id} className="productCard">
            <button className="cardPreview" onClick={() => onSelectProduct(product)}>
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="placeholder">No image</div>}
            </button>
            <div className="productBody">
              <div>
                <div className="muted">{product.category.name}</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
              <div className="cardFooter">
                <strong>${product.price.toFixed(2)}</strong>
                <span className="muted">Stock {product.stock}</span>
              </div>
              <div className="cardActions">
                <button onClick={() => onSelectProduct(product)}>Details</button>
                <button
                  className="primary"
                  onClick={() => onAddToCart(product.id)}
                  disabled={busy || product.stock < 1 || user?.role === 'SELLER'}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProductSpotlight({ product, onAddToCart, user, busy }) {
  return (
    <div className="panel spotlight">
      <div className="sectionHead">
        <div>
          <h2>Product Detail</h2>
          <p>Focused detail panel for the currently selected product.</p>
        </div>
      </div>
      {product ? (
        <>
          {product.images?.[0] ? <img className="spotlightImage" src={product.images[0]} alt={product.name} /> : null}
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <div className="detailRow"><span>Seller</span><strong>{product.seller.name}</strong></div>
          <div className="detailRow"><span>Category</span><strong>{product.category.name}</strong></div>
          <div className="detailRow"><span>Price</span><strong>${product.price.toFixed(2)}</strong></div>
          <div className="detailRow"><span>Stock</span><strong>{product.stock}</strong></div>
          <button
            className="primary wide"
            onClick={() => onAddToCart(product.id)}
            disabled={busy || product.stock < 1 || user?.role === 'SELLER'}
          >
            Add to cart
          </button>
        </>
      ) : (
        <p className="empty">Select a product to inspect its details.</p>
      )}
    </div>
  )
}

function CartView({ cart, onUpdateItem, onRemoveItem, onSubmitCheckout, busy }) {
  const [address, setAddress] = useState('')

  return (
    <div className="stack">
      <div className="sectionHead">
        <div>
          <h2>Cart + COD Checkout</h2>
          <p>Update quantities, review the total, and convert the cart into a confirmed COD order.</p>
        </div>
      </div>

      {!cart?.items?.length ? (
        <div className="panel empty">Your cart is empty.</div>
      ) : (
        <>
          <div className="panel">
            {cart.items.map((item) => (
              <div key={item.productId} className="cartRow">
                <div>
                  <strong>{item.product.name}</strong>
                  <div className="muted">${item.product.price.toFixed(2)} each</div>
                </div>
                <div className="cartControls">
                  <button onClick={() => onUpdateItem(item.productId, item.quantity - 1)} disabled={busy}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateItem(item.productId, item.quantity + 1)} disabled={busy}>+</button>
                  <strong>${item.subtotal.toFixed(2)}</strong>
                  <button onClick={() => onRemoveItem(item.productId)} disabled={busy}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="panel checkoutBox">
            <div className="detailRow"><span>Total items</span><strong>{cart.totalItems}</strong></div>
            <div className="detailRow"><span>Total amount</span><strong>${cart.totalAmount.toFixed(2)}</strong></div>
            <label>
              Shipping address
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={4} placeholder="123 Demo Street, District, City" />
            </label>
            <button className="primary wide" onClick={() => onSubmitCheckout(address)} disabled={busy || !address.trim()}>
              Confirm COD order
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function OrdersView({ orders }) {
  return (
    <div className="stack">
      <div className="sectionHead">
        <div>
          <h2>Orders</h2>
          <p>Minimal order history for the logged-in user.</p>
        </div>
      </div>
      {!orders.length ? (
        <div className="panel empty">No orders yet.</div>
      ) : (
        orders.map((order) => (
          <article key={order.id} className="panel orderCard">
            <div className="orderHead">
              <div>
                <strong>{order.id}</strong>
                <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <span className="pill">{order.status}</span>
            </div>
            <p>{order.address}</p>
            <ul className="orderItems">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>{item.product?.name || 'Unavailable product'} x {item.quantity}</span>
                  <strong>${item.priceAtPurchase.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <div className="detailRow">
              <span>Total</span>
              <strong>${order.total.toFixed(2)}</strong>
            </div>
          </article>
        ))
      )}
    </div>
  )
}

function AuthView({ onSubmit, busy }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'BUYER',
  })

  return (
    <div className="panel authCard">
      <div className="authTabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>

      <label>
        Email
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="buyer@example.com" />
      </label>
      <label>
        Password
        <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" />
      </label>

      {mode === 'register' ? (
        <>
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </select>
          </label>
        </>
      ) : null}

      <button
        className="primary wide"
        disabled={busy}
        onClick={() => onSubmit(mode, mode === 'login' ? {
          email: form.email,
          password: form.password,
        } : form)}
      >
        {mode === 'login' ? 'Login' : 'Create account'}
      </button>

      <div className="hint">
        Demo seed users after seeding: `buyer@example.com / buyer123` and `seller@example.com / seller123`
      </div>
    </div>
  )
}

function SellerView({ token, products, categories, onSave, onArchive, busy }) {
  const emptyForm = {
    name: '',
    description: '',
    price: '0',
    stock: '0',
    categoryId: '',
    imageUrls: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [uploading, setUploading] = useState(false)

  async function uploadImage(file) {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'products')
      const response = await apiFetch('/media/upload', {
        method: 'POST',
        body,
      }, token)
      const nextUrls = [form.imageUrls, response.data.url].filter(Boolean).join(', ')
      setForm((prev) => ({ ...prev, imageUrls: nextUrls }))
    } finally {
      setUploading(false)
    }
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId,
      imageUrls: (product.images || []).join(', '),
    })
  }

  async function submit() {
    await onSave({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      images: form.imageUrls.split(',').map((item) => item.trim()).filter(Boolean),
    }, editingId || undefined)
    setEditingId('')
    setForm(emptyForm)
  }

  return (
    <div className="stack sellerLayout">
      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>{editingId ? 'Edit product' : 'Create product'}</h2>
            <p>Minimal seller workspace for managing catalog items and optional image uploads.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Price
            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label>
            Stock
            <input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          </label>
          <label>
            Category
            <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="fullSpan">
            Description
            <textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="fullSpan">
            Image URLs
            <textarea rows={3} value={form.imageUrls} onChange={(event) => setForm({ ...form, imageUrls: event.target.value })} placeholder="comma-separated URLs" />
          </label>
          <label className="fullSpan">
            Upload an image
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])} />
          </label>
        </div>
        <div className="cardActions">
          <button onClick={() => { setEditingId(''); setForm(emptyForm) }}>Reset</button>
          <button className="primary" onClick={submit} disabled={busy || uploading}>
            {editingId ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>Your products</h2>
            <p>Products you own, including archived items.</p>
          </div>
        </div>
        {!products.length ? (
          <div className="empty">No products yet.</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="sellerRow">
              <div>
                <strong>{product.name}</strong>
                <div className="muted">{product.category.name} · {product.status}</div>
              </div>
              <div className="cardActions">
                <button onClick={() => startEdit(product)}>Edit</button>
                <button onClick={() => onArchive(product.id)} disabled={busy || product.status === 'ARCHIVED'}>Archive</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function InfoPanel({ user, cart }) {
  return (
    <div className="panel">
      <div className="sectionHead">
        <div>
          <h2>Session Summary</h2>
          <p>Quick reference for the current user and business rules enforced in this phase.</p>
        </div>
      </div>
      <div className="detailRow"><span>Role</span><strong>{user?.role || 'Guest'}</strong></div>
      <div className="detailRow"><span>COD only</span><strong>Enabled</strong></div>
      <div className="detailRow"><span>Cart items</span><strong>{cart?.totalItems || 0}</strong></div>
      <ul className="bulletList">
        <li>Only buyers can use cart and checkout.</li>
        <li>Only sellers can create or archive products.</li>
        <li>Archived or out-of-stock products fail during checkout.</li>
      </ul>
    </div>
  )
}
