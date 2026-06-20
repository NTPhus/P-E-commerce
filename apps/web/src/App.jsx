import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'
const SESSION_KEY = 'commerce-core-session'
const ORDER_FLOW = ['CONFIRMED', 'SHIPPING', 'COMPLETED']

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

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
      message = Array.isArray(data.message) ? data.message.join(', ') : data.message || data.error || message
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
  const [productPagination, setProductPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 1 })
  const [productSearch, setProductSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])
  const [buyerOrderStatus, setBuyerOrderStatus] = useState('')
  const [buyerOrderPagination, setBuyerOrderPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 })
  const [sellerProducts, setSellerProducts] = useState([])
  const [sellerOrders, setSellerOrders] = useState([])
  const [sellerOrderStatus, setSellerOrderStatus] = useState('')
  const [sellerOrderPagination, setSellerOrderPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 })
  const [adminOrders, setAdminOrders] = useState([])
  const [adminOrderStatus, setAdminOrderStatus] = useState('')
  const [adminOrderPagination, setAdminOrderPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 })
  const [adminMetrics, setAdminMetrics] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const token = session?.token
  const user = session?.user

  useEffect(() => {
    loadCatalog()
  }, [selectedCategory, productSearch, productPagination.page])

  useEffect(() => {
    if (token && user?.role === 'BUYER') {
      refreshBuyerOrders()
    }
  }, [token, user?.role, buyerOrderStatus, buyerOrderPagination.page])

  useEffect(() => {
    if (token && user?.role === 'SELLER') {
      refreshSellerOrders()
    }
  }, [token, user?.role, sellerOrderStatus, sellerOrderPagination.page])

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      refreshAdminOrders()
    }
  }, [token, user?.role, adminOrderStatus, adminOrderPagination.page])

  useEffect(() => {
    if (!token) {
      setCart(null)
      setOrders([])
      setSellerProducts([])
      setSellerOrders([])
      setAdminOrders([])
      setAdminMetrics(null)
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
      const productParams = new URLSearchParams()
      if (selectedCategory) productParams.set('categoryId', selectedCategory)
      if (productSearch.trim()) productParams.set('q', productSearch.trim())
      productParams.set('page', String(productPagination.page))
      productParams.set('pageSize', String(productPagination.pageSize))
      const [categoryData, productData] = await Promise.all([
        apiFetch('/categories'),
        apiFetch(`/products?${productParams.toString()}`),
      ])
      setCategories(categoryData)
      setProducts(productData.items)
      setProductPagination((prev) => ({
        ...prev,
        total: productData.total,
        totalPages: productData.totalPages,
      }))
      if (selectedProduct) {
        const latest = productData.items.find((item) => item.id === selectedProduct.id)
        setSelectedProduct(latest || null)
      }
    } catch (err) {
      setError(err.message || 'Unable to load catalog')
    }
  }

  async function refreshBuyerOrders(activeToken = token) {
    const params = new URLSearchParams()
    if (buyerOrderStatus) params.set('status', buyerOrderStatus)
    params.set('page', String(buyerOrderPagination.page))
    params.set('pageSize', String(buyerOrderPagination.pageSize))
    const orderData = await apiFetch(`/orders?${params.toString()}`, {}, activeToken)
    setOrders(orderData.items)
    setBuyerOrderPagination((prev) => ({ ...prev, total: orderData.total, totalPages: orderData.totalPages }))
  }

  async function refreshSellerOrders(activeToken = token) {
    const params = new URLSearchParams()
    if (sellerOrderStatus) params.set('status', sellerOrderStatus)
    params.set('page', String(sellerOrderPagination.page))
    params.set('pageSize', String(sellerOrderPagination.pageSize))
    const orderData = await apiFetch(`/seller/orders?${params.toString()}`, {}, activeToken)
    setSellerOrders(orderData.items)
    setSellerOrderPagination((prev) => ({ ...prev, total: orderData.total, totalPages: orderData.totalPages }))
  }

  async function refreshAdminOrders(activeToken = token) {
    const params = new URLSearchParams()
    if (adminOrderStatus) params.set('status', adminOrderStatus)
    params.set('page', String(adminOrderPagination.page))
    params.set('pageSize', String(adminOrderPagination.pageSize))
    const orderData = await apiFetch(`/admin/orders?${params.toString()}`, {}, activeToken)
    setAdminOrders(orderData.items)
    setAdminOrderPagination((prev) => ({ ...prev, total: orderData.total, totalPages: orderData.totalPages }))
  }

  async function refreshSessionData(activeSession = session) {
    if (!activeSession?.token) return

    try {
      const profile = await apiFetch('/auth/me', {}, activeSession.token)
      const nextSession = { ...activeSession, user: profile }
      setSession(nextSession)
      saveSession(nextSession)

      if (profile.role === 'BUYER') {
        const cartData = await apiFetch('/cart', {}, activeSession.token)
        setCart(cartData)
        await refreshBuyerOrders(activeSession.token)
      }

      if (profile.role === 'SELLER') {
        const productsData = await apiFetch('/seller/products', {}, activeSession.token)
        setSellerProducts(productsData)
        await refreshSellerOrders(activeSession.token)
      }

      if (profile.role === 'ADMIN') {
        const metricsData = await apiFetch('/admin/orders/metrics', {}, activeSession.token)
        setAdminMetrics(metricsData)
        await refreshAdminOrders(activeSession.token)
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
      setView(
        response.user.role === 'SELLER'
          ? 'seller'
          : response.user.role === 'ADMIN'
            ? 'operations'
            : 'catalog',
      )
      await refreshSessionData(response)
    }, mode === 'login' ? 'Logged in' : 'Account created')
  }

  function logout() {
    setSession(null)
    saveSession(null)
    setView('catalog')
    setSelectedProduct(null)
    setNotice('Logged out')
    setError('')
  }

  function openProduct(product) {
    setSelectedProduct(product)
    setView('product')
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
      setOrders((prev) => [order, ...prev].slice(0, buyerOrderPagination.pageSize))
      setCart((prev) => ({ ...(prev || {}), items: [], totalAmount: 0, totalItems: 0 }))
      await loadCatalog()
      await refreshBuyerOrders()
      setView('orders')
    }, 'Order placed successfully')
  }

  async function cancelBuyerOrder(orderId) {
    await runAction(async () => {
      const updatedOrder = await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
      }, token)
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      await loadCatalog()
      await refreshBuyerOrders()
    }, 'Order cancelled')
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

  async function updateSellerStock(product, nextStock) {
    await runAction(async () => {
      await apiFetch(`/seller/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: nextStock }),
      }, token)
      const nextProducts = await apiFetch('/seller/products', {}, token)
      setSellerProducts(nextProducts)
      await loadCatalog()
    }, 'Stock updated')
  }

  async function updateSellerOrderStatus(orderId, status) {
    await runAction(async () => {
      const updatedOrder = await apiFetch(`/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token)
      setSellerOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      await refreshSellerOrders()
    }, `Order marked ${status.toLowerCase()}`)
  }

  async function saveCategory(categoryId, name) {
    await runAction(async () => {
      const method = categoryId ? 'PATCH' : 'POST'
      const path = categoryId ? `/admin/categories/${categoryId}` : '/admin/categories'
      await apiFetch(path, {
        method,
        body: JSON.stringify({ name }),
      }, token)
      await loadCatalog()
    }, categoryId ? 'Category updated' : 'Category created')
  }

  async function deleteCategory(categoryId) {
    await runAction(async () => {
      await apiFetch(`/admin/categories/${categoryId}`, {
        method: 'DELETE',
      }, token)
      await loadCatalog()
    }, 'Category deleted')
  }

  async function updateAdminOrderStatus(orderId, status) {
    await runAction(async () => {
      const updatedOrder = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token)
      setAdminOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      setSellerOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      const metricsData = await apiFetch('/admin/orders/metrics', {}, token)
      setAdminMetrics(metricsData)
      await refreshAdminOrders()
      await loadCatalog()
    }, `Order marked ${status.toLowerCase()}`)
  }

  const heroStats = useMemo(() => ([
    { label: 'Products', value: productPagination.total || products.length },
    { label: 'Categories', value: categories.length },
    { label: 'Cart', value: cart?.totalItems || 0 },
  ]), [productPagination.total, products.length, categories.length, cart?.totalItems])

  const activeViewLabel = {
    catalog: 'Storefront',
    product: 'Product detail',
    cart: 'Shopping cart',
    checkout: 'Checkout',
    orders: 'Order history',
    seller: 'Seller workspace',
    operations: 'Operations',
    auth: 'Account access',
  }[view]

  if (user?.role === 'SELLER' && view === 'seller') {
    return (
      <div className="shell">
        <WorkspaceHeader
          eyebrow="Seller Workspace"
          title="Manage products and fulfillment"
          subtitle="Run seller operations with live catalog and incoming orders."
          user={user}
          onLogout={logout}
          onBackToStore={() => setView('catalog')}
        />
        {notice ? <div className="banner success">{notice}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        <SellerView
          token={token}
          products={sellerProducts}
          orders={sellerOrders}
          categories={categories}
          orderStatus={sellerOrderStatus}
          onOrderStatusChange={(value) => {
            setSellerOrderPagination((prev) => ({ ...prev, page: 1 }))
            setSellerOrderStatus(value)
          }}
          orderPagination={sellerOrderPagination}
          onChangeOrderPage={(page) => setSellerOrderPagination((prev) => ({ ...prev, page }))}
          busy={busy}
          onSave={saveProduct}
          onArchive={archiveProduct}
          onUpdateStock={updateSellerStock}
          onUpdateOrderStatus={updateSellerOrderStatus}
        />
      </div>
    )
  }

  if (user?.role === 'ADMIN' && view === 'operations') {
    return (
      <div className="shell">
        <WorkspaceHeader
          eyebrow="Operations"
          title="Platform overview and control"
          subtitle="Category governance and order status overrides for the commerce runtime."
          user={user}
          onLogout={logout}
          onBackToStore={() => setView('catalog')}
        />
        {notice ? <div className="banner success">{notice}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        <OperationsView
          categories={categories}
          orders={adminOrders}
          metrics={adminMetrics}
          orderStatus={adminOrderStatus}
          onOrderStatusChange={(value) => {
            setAdminOrderPagination((prev) => ({ ...prev, page: 1 }))
            setAdminOrderStatus(value)
          }}
          orderPagination={adminOrderPagination}
          onChangeOrderPage={(page) => setAdminOrderPagination((prev) => ({ ...prev, page }))}
          busy={busy}
          onSaveCategory={saveCategory}
          onDeleteCategory={deleteCategory}
          onUpdateOrderStatus={updateAdminOrderStatus}
        />
      </div>
    )
  }

  return (
    <div className="shell">
      <StoreHeader
        view={view}
        user={user}
        cart={cart}
        onNavigate={setView}
        onLogout={logout}
        onOpenAuth={() => setView('auth')}
        searchValue={view === 'catalog' ? productSearch : ''}
        onSearchChange={(value) => {
          setProductPagination((prev) => ({ ...prev, page: 1 }))
          setProductSearch(value)
        }}
      />

      {notice ? <div className="banner success">{notice}</div> : null}
      {error ? <div className="banner error">{error}</div> : null}

      {view === 'catalog' ? (
        <CatalogPage
          user={user}
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(value) => {
            setProductPagination((prev) => ({ ...prev, page: 1 }))
            setSelectedCategory(value)
          }}
          onOpenProduct={openProduct}
          onAddToCart={addToCart}
          busy={busy}
          stats={heroStats}
          pagination={productPagination}
          onChangePage={(page) => setProductPagination((prev) => ({ ...prev, page }))}
        />
      ) : null}

      {view === 'product' ? (
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setView('catalog')}
          onAddToCart={addToCart}
          busy={busy}
          user={user}
        />
      ) : null}

      {view === 'cart' ? (
        <CartPage
          cart={cart}
          busy={busy}
          onBack={() => setView('catalog')}
          onUpdateItem={updateCartItem}
          onRemoveItem={removeCartItem}
          onCheckout={() => setView('checkout')}
        />
      ) : null}

      {view === 'checkout' ? (
        <CheckoutPage
          cart={cart}
          busy={busy}
          onBack={() => setView('cart')}
          onSubmitCheckout={submitCheckout}
        />
      ) : null}

      {view === 'orders' ? (
        <OrdersPage
          orders={orders}
          busy={busy}
          statusFilter={buyerOrderStatus}
          onStatusChange={(value) => {
            setBuyerOrderPagination((prev) => ({ ...prev, page: 1 }))
            setBuyerOrderStatus(value)
          }}
          pagination={buyerOrderPagination}
          onChangePage={(page) => setBuyerOrderPagination((prev) => ({ ...prev, page }))}
          onBack={() => setView('catalog')}
          onCancel={cancelBuyerOrder}
        />
      ) : null}

      {view === 'auth' ? (
        <AuthPage busy={busy} onSubmit={handleAuth} onBack={() => setView('catalog')} />
      ) : null}

      {(view === 'catalog' || view === 'product') ? (
        <section className="storeInfoRail">
          <InfoPanel user={user} cart={cart} />
        </section>
      ) : null}

      {view !== 'seller' && view !== 'operations' ? (
        <section className="contextStrip">
          <ContextCard label="Current page" value={activeViewLabel} />
          <ContextCard label="COD checkout" value="Enabled for this MVP phase" />
          <ContextCard label="Buyer rule" value={user?.role === 'BUYER' ? `${cart?.totalItems || 0} items from one seller only` : 'Browse freely before sign in'} />
        </section>
      ) : null}
    </div>
  )
}

function StoreHeader({ view, user, cart, onNavigate, onLogout, onOpenAuth, searchValue, onSearchChange }) {
  const cartCount = cart?.totalItems || 0

  return (
    <>
      <header className="hero storeHero">
        <div className="heroCopy">
          <div className="eyebrow">Commerce Storefront</div>
          <h1>P-E-commerce</h1>
          <p>Browse products, inspect detail pages, manage a real cart, checkout COD and track orders with live API data.</p>
          <div className="heroHighlights">
            <span className="featurePill">Catalog</span>
            <span className="featurePill">Product detail</span>
            <span className="featurePill">Cart</span>
            <span className="featurePill">Checkout</span>
            <span className="featurePill">Orders</span>
          </div>
        </div>
        <div className="heroRail">
          <div className="heroNote">
            <span className="topbarLabel">Session</span>
            <strong>{user ? `${user.name} · ${user.role}` : 'Guest browsing'}</strong>
            <p>{user ? 'Use navigation below to switch between commerce pages.' : 'Login as buyer to add items to cart and place real COD orders.'}</p>
          </div>
        </div>
      </header>

      <nav className="topbar">
        <div className="storeBrand">
          <button className={`navTextButton ${view === 'catalog' ? 'activeText' : ''}`} onClick={() => onNavigate('catalog')}>Shop</button>
          <button className={`navTextButton ${view === 'orders' ? 'activeText' : ''}`} onClick={() => onNavigate('orders')}>Orders</button>
          <button className={`navTextButton ${view === 'cart' ? 'activeText' : ''}`} onClick={() => onNavigate('cart')}>Cart</button>
        </div>
        <div className="storeSearch">
          <input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search products..." />
        </div>
        <div className="storeActions">
          {user?.role === 'SELLER' ? <button onClick={() => onNavigate('seller')}>Seller</button> : null}
          {user?.role === 'ADMIN' ? <button onClick={() => onNavigate('operations')}>Operations</button> : null}
          <button className={`cartBadge ${view === 'cart' ? 'activeCartBadge' : ''}`} onClick={() => onNavigate('cart')}>
            Cart
            <span>{cartCount}</span>
          </button>
          {user ? (
            <>
              <span className="pill">{user.role}</span>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <button className="primary" onClick={onOpenAuth}>Login</button>
          )}
        </div>
      </nav>
    </>
  )
}

function CatalogPage({
  user, products, categories, selectedCategory, onSelectCategory, onOpenProduct, onAddToCart, busy, stats, pagination, onChangePage,
}) {
  return (
    <main className="storePage">
      <section className="catalogIntro">
        <div>
          <h2>Headphones, devices and commerce-ready listings</h2>
          <p>{pagination.total} products available from live seller inventory.</p>
        </div>
        <div className="miniStatGrid">
          {stats.map((item) => (
            <article key={item.label} className="summaryCard">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="chipRow">
          <button className={!selectedCategory ? 'chip active' : 'chip'} onClick={() => onSelectCategory('')}>All</button>
          {categories.map((category) => (
            <button key={category.id} className={selectedCategory === category.id ? 'chip active' : 'chip'} onClick={() => onSelectCategory(category.id)}>
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {!products.length ? (
        <div className="panel empty richEmpty">
          <strong>No products found.</strong>
          <span>Try another search or clear category filters.</span>
        </div>
      ) : (
        <section className="productGrid">
          {products.map((product) => (
            <article key={product.id} className="productCard">
              <button className="cardPreview" onClick={() => onOpenProduct(product)}>
                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="placeholder">No image</div>}
              </button>
              <div className="productBody">
                <div className="productMeta">
                  <span className="featurePill soft">{product.category.name}</span>
                  <span className="muted">{product.seller.name}</span>
                </div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="cardFooter">
                  <strong>{formatCurrency(product.price)}</strong>
                  <span className={product.stock > 0 ? 'stockTag' : 'stockTag soldOut'}>
                    {product.stock > 0 ? `Stock ${product.stock}` : 'Out of stock'}
                  </span>
                </div>
                <div className="cardActions">
                  <button onClick={() => onOpenProduct(product)}>View details</button>
                  <button className="primary" onClick={() => onAddToCart(product.id)} disabled={busy || product.stock < 1 || user?.role === 'SELLER' || user?.role === 'ADMIN'}>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      <PaginationControls pagination={pagination} onChangePage={onChangePage} />
    </main>
  )
}

function ProductDetailPage({ product, onBack, onAddToCart, busy, user }) {
  if (!product) {
    return (
      <div className="panel empty richEmpty">
        <strong>Product unavailable.</strong>
        <span>Return to the storefront and select another listing.</span>
      </div>
    )
  }

  return (
    <main className="storePage">
      <button className="backLink" onClick={onBack}>Back to Shop</button>
      <section className="detailPageGrid">
        <div className="detailMedia">
          <div className="detailHeroImage">
            {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="placeholder">No image</div>}
          </div>
          <div className="thumbRow">
            {(product.images?.length ? product.images : [null, null, null, null]).slice(0, 4).map((image, index) => (
              <div key={`${product.id}-${index}`} className="thumbCard">
                {image ? <img src={image} alt={`${product.name} ${index + 1}`} /> : <div className="placeholder small">Preview</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="panel detailInfo">
          <div className="productMeta">
            <span className="featurePill soft">{product.category.name}</span>
            <span className="muted">{product.seller.name}</span>
          </div>
          <div>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </div>
          <div className="detailPrice">{formatCurrency(product.price)}</div>
          <div className="detailFeatureList">
            <div className="orderMetaCard"><span>Seller</span><strong>{product.seller.name}</strong></div>
            <div className="orderMetaCard"><span>Category</span><strong>{product.category.name}</strong></div>
            <div className="orderMetaCard"><span>Availability</span><strong>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</strong></div>
            <div className="orderMetaCard"><span>Payment</span><strong>Cash on delivery</strong></div>
          </div>
          <div className="detailBenefits">
            <div className="benefitCard"><strong>Live inventory</strong><span>Stock is validated during cart updates and checkout.</span></div>
            <div className="benefitCard"><strong>Seller-owned</strong><span>Products are managed directly from seller workspace.</span></div>
            <div className="benefitCard"><strong>Real order flow</strong><span>This page adds to a real cart backed by the API.</span></div>
          </div>
          <div className="buyerActionBar">
            <button className="primary wide" onClick={() => onAddToCart(product.id)} disabled={busy || product.stock < 1 || user?.role === 'SELLER' || user?.role === 'ADMIN'}>
              Add to Cart
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function CartPage({ cart, busy, onBack, onUpdateItem, onRemoveItem, onCheckout }) {
  const subtotal = cart?.totalAmount || 0
  const shipping = subtotal ? 0 : 0
  const tax = 0
  const total = subtotal + shipping + tax

  return (
    <main className="storePage">
      <button className="backLink" onClick={onBack}>Continue Shopping</button>
      <div className="pageTitleBlock">
        <h2>Shopping Cart</h2>
        <p>Review quantities before moving to COD checkout.</p>
      </div>

      {!cart?.items?.length ? (
        <div className="panel empty richEmpty">
          <strong>Your cart is empty.</strong>
          <span>Add a product from the storefront first.</span>
        </div>
      ) : (
        <div className="cartLayout">
          <section className="stack">
            {cart.items.map((item) => (
              <article key={item.productId} className="panel cartItemCard">
                <div className="cartItemImage">
                  {item.product.images?.[0] ? <img src={item.product.images[0]} alt={item.product.name} /> : <div className="placeholder">No image</div>}
                </div>
                <div className="cartItemBody">
                  <div className="cartItemHead">
                    <div>
                      <h3>{item.product.name}</h3>
                      <p className="muted">{item.product.seller.name}</p>
                    </div>
                    <button onClick={() => onRemoveItem(item.productId)} disabled={busy}>Remove</button>
                  </div>
                  <div className="cartItemFoot">
                    <div className="cartControls">
                      <button onClick={() => onUpdateItem(item.productId, item.quantity - 1)} disabled={busy}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateItem(item.productId, item.quantity + 1)} disabled={busy}>+</button>
                    </div>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="panel summarySidebar">
            <h3>Order Summary</h3>
            <div className="detailRow"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="detailRow"><span>Shipping</span><strong>{formatCurrency(shipping)}</strong></div>
            <div className="detailRow"><span>Tax</span><strong>{formatCurrency(tax)}</strong></div>
            <div className="detailRow totalRow"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            <button className="primary wide" onClick={onCheckout}>Proceed to Checkout</button>
            <button className="wide" onClick={onBack}>Continue Shopping</button>
          </aside>
        </div>
      )}
    </main>
  )
}

function CheckoutPage({ cart, busy, onBack, onSubmitCheckout }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
  })

  if (!cart?.items?.length) {
    return (
      <main className="storePage">
        <button className="backLink" onClick={onBack}>Back to Cart</button>
        <div className="panel empty richEmpty">
          <strong>No items to checkout.</strong>
          <span>Return to your cart and add products first.</span>
        </div>
      </main>
    )
  }

  const subtotal = cart.totalAmount
  const total = subtotal

  const fullAddress = [
    `${form.firstName} ${form.lastName}`.trim(),
    form.addressLine,
    [form.city, form.state, form.zipCode].filter(Boolean).join(', '),
    form.phone ? `Phone: ${form.phone}` : '',
    form.email ? `Email: ${form.email}` : '',
  ].filter(Boolean).join(' | ')

  return (
    <main className="storePage">
      <button className="backLink" onClick={onBack}>Back to Cart</button>
      <div className="checkoutPageGrid">
        <section className="stack">
          <article className="panel checkoutSection">
            <div className="sectionHead">
              <div>
                <h2>Shipping Information</h2>
                <p>Collect a structured address, then submit the combined payload to COD checkout.</p>
              </div>
            </div>
            <div className="formGrid">
              <label>
                First Name
                <input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="John" />
              </label>
              <label>
                Last Name
                <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Doe" />
              </label>
              <label className="fullSpan">
                Email
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="john@example.com" />
              </label>
              <label className="fullSpan">
                Address
                <input value={form.addressLine} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} placeholder="123 Main Street" />
              </label>
              <label>
                City
                <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Bangkok" />
              </label>
              <label>
                State / Province
                <input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} placeholder="Central" />
              </label>
              <label>
                ZIP Code
                <input value={form.zipCode} onChange={(event) => setForm({ ...form, zipCode: event.target.value })} placeholder="10110" />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+66..." />
              </label>
            </div>
          </article>

          <article className="panel checkoutSection">
            <div className="sectionHead">
              <div>
                <h2>Payment Information</h2>
                <p>This MVP only supports cash on delivery, so payment is confirmed after delivery.</p>
              </div>
              <div className="secureNote">COD only</div>
            </div>
            <div className="paymentDisabled">
              <div className="summaryCard emphasis">
                <span>Payment method</span>
                <strong>Cash on delivery</strong>
              </div>
              <p className="muted">No card gateway is integrated in this phase. The order is still created with full stock validation and transaction safety.</p>
            </div>
          </article>
        </section>

        <aside className="panel summarySidebar">
          <h3>Order Summary</h3>
          <div className="stack compact">
            {cart.items.map((item) => (
              <div key={item.productId} className="checkoutSummaryItem">
                <div>
                  <strong>{item.product.name}</strong>
                  <span className="muted">Qty: {item.quantity}</span>
                </div>
                <strong>{formatCurrency(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="detailRow"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="detailRow totalRow"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
          <button className="primary wide" onClick={() => onSubmitCheckout(fullAddress)} disabled={busy || !form.addressLine.trim() || !form.firstName.trim()}>
            Place COD Order
          </button>
          <p className="hint">By placing this order, you confirm the delivery address and accept COD as the only payment method for this phase.</p>
        </aside>
      </div>
    </main>
  )
}

function OrdersPage({ orders, busy, statusFilter, onStatusChange, pagination, onChangePage, onBack, onCancel }) {
  return (
    <main className="storePage">
      <button className="backLink" onClick={onBack}>Back to Shop</button>
      <div className="pageTitleBlock">
        <h2>Order History</h2>
        <p>Track your live orders and cancel while still confirmed.</p>
      </div>
      <OrderFilter value={statusFilter} onChange={onStatusChange} />
      {!orders.length ? (
        <div className="panel empty richEmpty">
          <strong>No orders yet.</strong>
          <span>Your completed checkout history will appear here.</span>
        </div>
      ) : (
        <section className="stack">
          {orders.map((order) => (
            <article key={order.id} className="panel historyCard">
              <div className="historyHeader">
                <div className="historyMeta">
                  <div><span>Order Number</span><strong>{order.id}</strong></div>
                  <div><span>Date</span><strong>{new Date(order.createdAt).toLocaleString()}</strong></div>
                  <div><span>Total</span><strong>{formatCurrency(order.total)}</strong></div>
                </div>
                <span className="pill">{order.status}</span>
              </div>
              <div className="orderMetaGrid">
                <div className="orderMetaCard"><span>Delivery</span><strong>{order.address}</strong></div>
                <div className="orderMetaCard"><span>Item count</span><strong>{order.items.length}</strong></div>
              </div>
              <StatusTimeline status={order.status} />
              <div className="historyItems">
                {order.items.map((item) => (
                  <div key={item.id} className="historyItemRow">
                    <div>
                      <strong>{item.product?.name || 'Unavailable product'}</strong>
                      <span className="muted">Quantity: {item.quantity}</span>
                    </div>
                    <strong>{formatCurrency(item.priceAtPurchase * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              {order.status === 'CONFIRMED' ? (
                <div className="cardActions">
                  <button onClick={() => onCancel(order.id)} disabled={busy}>Cancel order</button>
                </div>
              ) : null}
            </article>
          ))}
          <PaginationControls pagination={pagination} onChangePage={onChangePage} />
        </section>
      )}
    </main>
  )
}

function AuthPage({ busy, onSubmit, onBack }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'BUYER',
  })

  return (
    <main className="authScreen">
      <section className="authSplit">
        <div className="authBrandPanel">
          <div className="eyebrow">P-E-commerce</div>
          <h2>Commerce access for buyers, sellers and admins</h2>
          <p>Use seeded accounts or create a buyer or seller account. Buyers can complete the full browse to COD order journey immediately.</p>
          <div className="miniStatGrid">
            <article className="summaryCard"><span>Buyer seed</span><strong>buyer@example.com</strong></article>
            <article className="summaryCard"><span>Seller seed</span><strong>seller@example.com</strong></article>
            <article className="summaryCard"><span>Admin seed</span><strong>admin@example.com</strong></article>
          </div>
        </div>

        <div className="panel authFormPanel">
          <button className="backLink tight" onClick={onBack}>Back to Shop</button>
          <div>
            <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
            <p>{mode === 'login' ? 'Enter your credentials to continue.' : 'Register a buyer or seller account for this MVP.'}</p>
          </div>
          <div className="authTabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" />
          </label>
          {mode === 'register' ? (
            <>
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your display name" />
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
          <button className="primary wide" disabled={busy} onClick={() => onSubmit(mode, mode === 'login' ? { email: form.email, password: form.password } : form)}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <div className="authSeedList">
            <p>Demo credentials</p>
            <ul className="bulletList">
              <li>Buyer: `buyer@example.com / buyer123`</li>
              <li>Seller: `seller@example.com / seller123`</li>
              <li>Admin: `admin@example.com / admin123`</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

function WorkspaceHeader({ eyebrow, title, subtitle, user, onLogout, onBackToStore }) {
  return (
    <header className="hero storeHero">
      <div className="heroCopy">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heroRail">
        <div className="heroNote">
          <span className="topbarLabel">Active user</span>
          <strong>{user.name} · {user.role}</strong>
          <div className="cardActions">
            <button onClick={onBackToStore}>Back to storefront</button>
            <button className="primary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  )
}

function SellerView({
  token, products, orders, categories, orderStatus, onOrderStatusChange, orderPagination, onChangeOrderPage,
  onSave, onArchive, onUpdateStock, onUpdateOrderStatus, busy,
}) {
  const emptyForm = { name: '', description: '', price: '0', stock: '0', categoryId: '', imageUrls: '' }
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sellerSection, setSellerSection] = useState('products')
  const [productSearch, setProductSearch] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  const filteredProducts = products.filter((product) => {
    const matchesSearch = !productSearch.trim()
      || `${product.name} ${product.description} ${product.category?.name || ''}`.toLowerCase().includes(productSearch.trim().toLowerCase())
    const matchesStatus = !productStatusFilter || product.status === productStatusFilter
    return matchesSearch && matchesStatus
  })

  const lowStockProducts = filteredProducts.filter((product) => product.stock <= 5)
  const filteredOrders = orders.filter((order) => {
    const keyword = orderSearch.trim().toLowerCase()

    if (!keyword) return true

    return [
      order.id,
      order.address,
      ...order.items
        .filter((item) => item.belongsToSeller)
        .map((item) => item.product?.name || ''),
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })

  async function uploadImage(file) {
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'products')
      const response = await apiFetch('/media/upload', { method: 'POST', body }, token)
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
    <div className="stack">
      <div className="summaryGrid orderSummaryGrid">
        <div className="summaryCard"><span>Products</span><strong>{products.length}</strong></div>
        <div className="summaryCard"><span>Active</span><strong>{products.filter((product) => product.status === 'ACTIVE').length}</strong></div>
        <div className="summaryCard"><span>Archived</span><strong>{products.filter((product) => product.status === 'ARCHIVED').length}</strong></div>
        <div className="summaryCard"><span>Orders</span><strong>{orders.length}</strong></div>
      </div>

      <div className="panel">
        <div className="sellerSectionTabs">
          <button className={sellerSection === 'products' ? 'active' : ''} onClick={() => setSellerSection('products')}>Products</button>
          <button className={sellerSection === 'inventory' ? 'active' : ''} onClick={() => setSellerSection('inventory')}>Inventory</button>
          <button className={sellerSection === 'orders' ? 'active' : ''} onClick={() => setSellerSection('orders')}>Orders</button>
        </div>
      </div>

      {sellerSection === 'products' ? (
        <>
      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>{editingId ? 'Edit Product' : 'Create Product'}</h2>
            <p>Manage your listing details and media uploads.</p>
          </div>
        </div>
        <div className="workspaceNote">
          <div>
            <strong>Seller tools</strong>
            <span>Image upload is wired to the live media API and product writes go to the real backend.</span>
          </div>
          <span className="featurePill soft">{editingId ? 'Editing' : 'Creating'}</span>
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
          <button className="primary" onClick={submit} disabled={busy || uploading}>{editingId ? 'Save changes' : 'Create product'}</button>
        </div>
      </div>

      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>Your Products</h2>
            <p>Inventory under your ownership.</p>
          </div>
        </div>
        <div className="sellerFilterBar">
          <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search your products..." />
          <select value={productStatusFilter} onChange={(event) => setProductStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        {!products.length ? (
          <div className="empty richEmpty"><strong>No products yet.</strong><span>Create your first listing.</span></div>
        ) : (
          <div className="managementList">
            {filteredProducts.map((product) => (
              <div key={product.id} className="sellerRow sellerCardRow">
                <div>
                  <strong>{product.name}</strong>
                  <div className="muted">{product.category.name} · {product.status}</div>
                  <div className="lineNote">{formatCurrency(product.price)} · Stock {product.stock}</div>
                </div>
                <div className="cardActions">
                  <button onClick={() => startEdit(product)}>Edit</button>
                  <button onClick={() => onArchive(product.id)} disabled={busy || product.status === 'ARCHIVED'}>Archive</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      ) : null}

      {sellerSection === 'inventory' ? (
        <div className="panel">
          <div className="sectionHead">
            <div>
              <h2>Inventory Control</h2>
              <p>Adjust stock quickly without opening the full product editor.</p>
            </div>
          </div>
          <div className="sellerFilterBar">
            <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search inventory..." />
            <select value={productStatusFilter} onChange={(event) => setProductStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          {lowStockProducts.length ? (
            <div className="inventoryAlert">
              <strong>{lowStockProducts.length} low-stock products</strong>
              <span>Items with stock less than or equal to 5 are highlighted for quick replenishment.</span>
            </div>
          ) : null}
          {!filteredProducts.length ? (
            <div className="empty richEmpty"><strong>No products match this filter.</strong><span>Try clearing the search or status filter.</span></div>
          ) : (
            <div className="inventoryList">
              {filteredProducts.map((product) => (
                <article key={product.id} className={`inventoryCard ${product.stock <= 5 ? 'low' : ''}`}>
                  <div>
                    <strong>{product.name}</strong>
                    <div className="muted">{product.category.name} · {product.status}</div>
                    <div className="lineNote">{formatCurrency(product.price)}</div>
                  </div>
                  <div className="inventoryControls">
                    <span className={product.stock <= 5 ? 'stockTag soldOut' : 'stockTag'}>Stock {product.stock}</span>
                    <div className="cardActions">
                      <button onClick={() => onUpdateStock(product, Math.max(0, product.stock - 1))} disabled={busy || product.stock <= 0}>-1</button>
                      <button onClick={() => onUpdateStock(product, product.stock + 1)} disabled={busy}>+1</button>
                      <button onClick={() => onUpdateStock(product, product.stock + 5)} disabled={busy}>+5</button>
                      <button onClick={() => startEdit(product)} disabled={busy}>Open editor</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {sellerSection === 'orders' ? (
      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>Incoming Orders</h2>
            <p>Advance order status from confirmed to shipping to completed.</p>
          </div>
        </div>
        <OrderFilter value={orderStatus} onChange={onOrderStatusChange} />
        <div className="sellerFilterBar">
          <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search orders by id, address, product..." />
        </div>
        {!orders.length ? (
          <div className="empty richEmpty"><strong>No incoming orders yet.</strong><span>Buyer orders assigned to your catalog will show up here.</span></div>
        ) : !filteredOrders.length ? (
          <div className="empty richEmpty"><strong>No orders match this search.</strong><span>Try a different order id, address, or product keyword.</span></div>
        ) : (
          <>
            {filteredOrders.map((order) => (
              <article key={order.id} className="orderCard">
                <div className="orderHead">
                  <div>
                    <strong>{order.id}</strong>
                    <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="pill">{order.status}</span>
                </div>
                <div className="orderMetaGrid">
                  <div className="orderMetaCard"><span>Ship to</span><strong>{order.address}</strong></div>
                  <div className="orderMetaCard"><span>Seller total</span><strong>{formatCurrency(order.items.filter((item) => item.belongsToSeller).reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0))}</strong></div>
                </div>
                <StatusTimeline status={order.status} />
                <ul className="orderItems orderLineList">
                  {order.items.filter((item) => item.belongsToSeller).map((item) => (
                    <li key={item.id}>
                      <span>{item.product?.name || 'Unavailable product'} x {item.quantity}</span>
                      <strong>{formatCurrency(item.priceAtPurchase)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="cardActions">
                  <button onClick={() => onUpdateOrderStatus(order.id, 'SHIPPING')} disabled={busy || order.status !== 'CONFIRMED'}>Mark shipping</button>
                  <button onClick={() => onUpdateOrderStatus(order.id, 'COMPLETED')} disabled={busy || order.status !== 'SHIPPING'}>Mark completed</button>
                </div>
              </article>
            ))}
            <PaginationControls pagination={orderPagination} onChangePage={onChangeOrderPage} />
          </>
        )}
      </div>
      ) : null}
    </div>
  )
}

function OperationsView({
  categories, orders, metrics, orderStatus, onOrderStatusChange, orderPagination, onChangeOrderPage,
  busy, onSaveCategory, onDeleteCategory, onUpdateOrderStatus,
}) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState('')

  async function submitCategory() {
    await onSaveCategory(editingId || undefined, name)
    setName('')
    setEditingId('')
  }

  const statusEntries = Object.entries(metrics?.byStatus || {})

  return (
    <div className="stack">
      <div className="metricsGrid">
        <MetricCard label="Orders" value={metrics?.orderCount || 0} />
        <MetricCard label="Revenue" value={formatCurrency(metrics?.grossRevenue || 0)} />
        <MetricCard label="Sellers" value={metrics?.sellerCount || 0} />
        <MetricCard label="Buyers" value={metrics?.buyerCount || 0} />
      </div>

      {statusEntries.length ? (
        <section className="panel">
          <div className="chipRow">
            {statusEntries.map(([status, count]) => (
              <span key={status} className="chip active">{status}: {count}</span>
            ))}
          </div>
        </section>
      ) : null}

      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>Category Operations</h2>
            <p>Create and maintain storefront taxonomy.</p>
          </div>
        </div>
        <div className="inlineForm">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" />
          <button onClick={() => { setName(''); setEditingId('') }}>Reset</button>
          <button className="primary" onClick={submitCategory} disabled={busy || !name.trim()}>{editingId ? 'Save category' : 'Create category'}</button>
        </div>
        <div className="stack compact">
          {categories.map((category) => (
            <div key={category.id} className="sellerRow sellerCardRow">
              <div>
                <strong>{category.name}</strong>
                <div className="lineNote">Catalog grouping for storefront and seller products.</div>
              </div>
              <div className="cardActions">
                <button onClick={() => { setEditingId(category.id); setName(category.name) }}>Edit</button>
                <button onClick={() => onDeleteCategory(category.id)} disabled={busy}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="sectionHead">
          <div>
            <h2>Order Oversight</h2>
            <p>Override order states or cancel invalid flows.</p>
          </div>
        </div>
        <OrderFilter value={orderStatus} onChange={onOrderStatusChange} />
        {!orders.length ? (
          <div className="empty richEmpty"><strong>No orders available.</strong><span>Use filters once volume increases.</span></div>
        ) : (
          <>
            {orders.map((order) => (
              <article key={order.id} className="orderCard">
                <div className="orderHead">
                  <div>
                    <strong>{order.id}</strong>
                    <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="pill">{order.status}</span>
                </div>
                <div className="orderMetaGrid">
                  <div className="orderMetaCard"><span>Delivery</span><strong>{order.address}</strong></div>
                  <div className="orderMetaCard"><span>Total</span><strong>{formatCurrency(order.total)}</strong></div>
                </div>
                <StatusTimeline status={order.status} />
                <ul className="orderItems orderLineList">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span>{item.product?.name || 'Unavailable product'} x {item.quantity}</span>
                      <strong>{formatCurrency(item.priceAtPurchase)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="cardActions">
                  <button onClick={() => onUpdateOrderStatus(order.id, 'CONFIRMED')} disabled={busy || order.status === 'CONFIRMED'}>Confirm</button>
                  <button onClick={() => onUpdateOrderStatus(order.id, 'SHIPPING')} disabled={busy || order.status === 'SHIPPING'}>Shipping</button>
                  <button onClick={() => onUpdateOrderStatus(order.id, 'COMPLETED')} disabled={busy || order.status === 'COMPLETED'}>Complete</button>
                  <button onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')} disabled={busy || order.status === 'CANCELLED'}>Cancel</button>
                </div>
              </article>
            ))}
            <PaginationControls pagination={orderPagination} onChangePage={onChangeOrderPage} />
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="statCard metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function InfoPanel({ user, cart }) {
  return (
    <div className="panel">
      <div className="sectionHead">
        <div>
          <h2>Session Summary</h2>
          <p>Commerce rules currently active in this runtime.</p>
        </div>
      </div>
      <div className="summaryGrid">
        <div className="summaryCard"><span>Role</span><strong>{user?.role || 'Guest'}</strong></div>
        <div className="summaryCard"><span>COD only</span><strong>Enabled</strong></div>
        <div className="summaryCard"><span>Cart items</span><strong>{cart?.totalItems || 0}</strong></div>
      </div>
      <ul className="bulletList">
        <li>Cart can only contain products from one seller at a time.</li>
        <li>Checkout validates stock and clears cart in one transaction.</li>
        <li>Seller manages only their own products and orders.</li>
        <li>Admin can override order states and manage categories.</li>
      </ul>
    </div>
  )
}

function ContextCard({ label, value }) {
  return (
    <article className="contextCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function OrderFilter({ value, onChange }) {
  return (
    <label className="filterControl">
      Status filter
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All statuses</option>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="SHIPPING">SHIPPING</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
    </label>
  )
}

function PaginationControls({ pagination, onChangePage }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <div className="cardActions paginationBar">
      <span className="muted">Results</span>
      <strong>{pagination.total}</strong>
      <button onClick={() => onChangePage(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1}>Previous</button>
      <span className="pill">Page {pagination.page} / {pagination.totalPages}</span>
      <button onClick={() => onChangePage(Math.min(pagination.totalPages, pagination.page + 1))} disabled={pagination.page >= pagination.totalPages}>Next</button>
    </div>
  )
}

function StatusTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="statusRail cancelled">
        <div className="statusNode active danger">Cancelled</div>
      </div>
    )
  }

  const activeIndex = ORDER_FLOW.indexOf(status)

  return (
    <div className="statusRail">
      {ORDER_FLOW.map((step, index) => (
        <React.Fragment key={step}>
          <div className={`statusNode ${index <= activeIndex ? 'active' : ''}`}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
          {index < ORDER_FLOW.length - 1 ? <div className={`statusConnector ${index < activeIndex ? 'active' : ''}`} /> : null}
        </React.Fragment>
      ))}
    </div>
  )
}
