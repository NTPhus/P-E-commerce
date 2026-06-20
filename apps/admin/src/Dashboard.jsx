import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'
const SESSION_KEY = 'commerce-admin-session'
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

export default function Dashboard() {
  const [session, setSession] = useState(() => loadSession())
  const [section, setSection] = useState('dashboard')
  const [metrics, setMetrics] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [orderStatus, setOrderStatus] = useState('')
  const [orderPagination, setOrderPagination] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 })
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin123' })
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (session?.token) {
      refresh(session.token)
    }
  }, [session?.token, orderStatus, orderPagination.page])

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

  async function refresh(token = session?.token) {
    if (!token) return
    const params = new URLSearchParams()
    if (orderStatus) params.set('status', orderStatus)
    params.set('page', String(orderPagination.page))
    params.set('pageSize', String(orderPagination.pageSize))

    const productParams = new URLSearchParams()
    productParams.set('page', '1')
    productParams.set('pageSize', '50')

    const [metricsData, orderData, categoryData, productData] = await Promise.all([
      apiFetch('/admin/orders/metrics', {}, token),
      apiFetch(`/admin/orders?${params.toString()}`, {}, token),
      apiFetch('/categories', {}, token),
      apiFetch(`/products?${productParams.toString()}`, {}, token),
    ])

    setMetrics(metricsData)
    setOrders(orderData.items)
    setProducts(productData.items)
    setOrderPagination((prev) => ({
      ...prev,
      total: orderData.total,
      totalPages: orderData.totalPages,
    }))
    setCategories(categoryData)
  }

  async function login() {
    await runAction(async () => {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSession(response)
      saveSession(response)
      await refresh(response.token)
    }, 'Admin session ready')
  }

  function logout() {
    setSession(null)
    saveSession(null)
    setSection('dashboard')
    setMetrics(null)
    setOrders([])
    setProducts([])
    setOrderStatus('')
    setOrderPagination({ page: 1, pageSize: 8, total: 0, totalPages: 1 })
    setCategories([])
    setNotice('Logged out')
    setError('')
  }

  async function saveCategory() {
    await runAction(async () => {
      const method = editingCategoryId ? 'PATCH' : 'POST'
      const path = editingCategoryId ? `/admin/categories/${editingCategoryId}` : '/admin/categories'
      await apiFetch(path, {
        method,
        body: JSON.stringify({ name: categoryName }),
      }, session.token)
      setCategoryName('')
      setEditingCategoryId('')
      await refresh()
    }, editingCategoryId ? 'Category updated' : 'Category created')
  }

  async function deleteCategory(categoryId) {
    await runAction(async () => {
      await apiFetch(`/admin/categories/${categoryId}`, { method: 'DELETE' }, session.token)
      await refresh()
    }, 'Category deleted')
  }

  async function updateOrderStatus(orderId, status) {
    await runAction(async () => {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, session.token)
      await refresh()
    }, `Order marked ${status.toLowerCase()}`)
  }

  if (!session?.token) {
    return (
      <div className="adminShell">
        <div className="authCanvas">
          <div className="loginCard">
            <div className="loginLayout">
              <div className="loginCopy">
                <div className="eyebrow">Admin Console</div>
                <h1>Platform control for the commerce runtime</h1>
                <p>Use the seeded admin session to access dashboard metrics, product oversight, category governance and order control.</p>
                <div className="loginFeatureGrid">
                  <article className="loginFeatureCard">
                    <span>Metrics</span>
                    <strong>Revenue, orders, buyers, sellers</strong>
                  </article>
                  <article className="loginFeatureCard">
                    <span>Products</span>
                    <strong>Catalog-wide visibility</strong>
                  </article>
                  <article className="loginFeatureCard">
                    <span>Orders</span>
                    <strong>Status override controls</strong>
                  </article>
                </div>
              </div>
              <div className="loginForm">
                {error ? <div className="banner error">{error}</div> : null}
                <label>
                  Email
                  <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </label>
                <label>
                  Password
                  <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                </label>
                <button className="primary wide" onClick={login} disabled={busy}>Login as admin</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusEntries = Object.entries(metrics?.byStatus || {})
  const productStats = useMemo(() => ([
    { label: 'Total products', value: products.length },
    { label: 'In stock', value: products.filter((product) => product.stock > 0).length },
    { label: 'Out of stock', value: products.filter((product) => product.stock < 1).length },
    { label: 'Categories', value: categories.length },
  ]), [products, categories.length])
  const dashboardStats = [
    { label: 'Revenue', value: formatCurrency(metrics?.grossRevenue || 0) },
    { label: 'Orders', value: metrics?.orderCount || 0 },
    { label: 'Sellers', value: metrics?.sellerCount || 0 },
    { label: 'Buyers', value: metrics?.buyerCount || 0 },
  ]
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="adminApp">
      <aside className="adminSidebar">
        <div className="sidebarBrand">
          <div className="eyebrow">Admin Panel</div>
          <strong>Commerce Ops</strong>
        </div>
        <nav className="sidebarNav">
          <button className={section === 'dashboard' ? 'sideLink active' : 'sideLink'} onClick={() => setSection('dashboard')}>Dashboard</button>
          <button className={section === 'products' ? 'sideLink active' : 'sideLink'} onClick={() => setSection('products')}>Products</button>
          <button className={section === 'orders' ? 'sideLink active' : 'sideLink'} onClick={() => setSection('orders')}>Orders</button>
          <button className={section === 'categories' ? 'sideLink active' : 'sideLink'} onClick={() => setSection('categories')}>Categories</button>
        </nav>
        <div className="sidebarFoot">
          <div className="sessionBadge">
            <span>{session.user.name}</span>
            <strong>{session.user.role}</strong>
          </div>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <div className="adminMain">
        <header className="adminTopbar">
          <div>
            <span className="topLabel">Current section</span>
            <h1>{section === 'dashboard' ? 'Operations Dashboard' : section === 'products' ? 'Product Oversight' : section === 'orders' ? 'Order Management' : 'Category Management'}</h1>
          </div>
          <div className="topbarActions">
            <div className="topbarSearch">
              <input
                value={section === 'orders' ? orderStatus : ''}
                readOnly
                placeholder={section === 'orders' ? 'Use status filter below' : 'Live data connected'}
              />
            </div>
            <div className="sessionChip">
              <span>Session</span>
              <strong>{session.user.name}</strong>
            </div>
          </div>
        </header>

        {notice ? <div className="banner success">{notice}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}

        {section === 'dashboard' ? (
          <main className="adminContent stack">
            <section className="metricsGrid">
              {dashboardStats.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.value} />
              ))}
            </section>

            <section className="contentGrid">
              <article className="adminCard tableCard">
                <div className="sectionHead">
                  <div>
                    <h2>Recent Orders</h2>
                    <p>Latest activity from the live commerce backend.</p>
                  </div>
                </div>
                <div className="tableList">
                  <div className="tableRow tableHead">
                    <span>Order</span>
                    <span>Status</span>
                    <span>Total</span>
                  </div>
                  {recentOrders.map((order) => (
                    <div key={order.id} className="tableRow">
                      <div>
                        <strong>{order.id}</strong>
                        <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
                      </div>
                      <span className="miniBadge">{order.status}</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="adminCard sideSummaryCard">
                <div className="sectionHead">
                  <div>
                    <h2>Status Mix</h2>
                    <p>Order distribution in the current system snapshot.</p>
                  </div>
                </div>
                <div className="chipRow">
                  {statusEntries.map(([status, count]) => (
                    <span key={status} className="chip active">{status}: {count}</span>
                  ))}
                </div>
                <div className="summaryStack">
                  <div className="summaryLine"><span>Visible products</span><strong>{products.length}</strong></div>
                  <div className="summaryLine"><span>Categories</span><strong>{categories.length}</strong></div>
                  <div className="summaryLine"><span>Filtered orders</span><strong>{orderPagination.total}</strong></div>
                </div>
              </article>
            </section>
          </main>
        ) : null}

        {section === 'products' ? (
          <main className="adminContent stack">
            <section className="metricsGrid">
              {productStats.map((item) => (
                <MetricCard key={item.label} label={item.label} value={item.value} />
              ))}
            </section>

            <section className="adminCard">
              <div className="sectionHead">
                <div>
                  <h2>Catalog Product Index</h2>
                  <p>Read-only admin visibility using the live storefront catalog endpoint.</p>
                </div>
              </div>
              <div className="tableList">
                <div className="tableRow tableHead productGridHead">
                  <span>Product</span>
                  <span>Category</span>
                  <span>Seller</span>
                  <span>Price</span>
                  <span>Stock</span>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="tableRow productGridHead">
                    <div>
                      <strong>{product.name}</strong>
                      <div className="muted">{product.description}</div>
                    </div>
                    <span>{product.category?.name || '-'}</span>
                    <span>{product.seller?.name || '-'}</span>
                    <strong>{formatCurrency(product.price)}</strong>
                    <span className={product.stock > 0 ? 'miniBadge ok' : 'miniBadge danger'}>{product.stock}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        ) : null}

        {section === 'orders' ? (
          <main className="adminContent stack">
            <section className="adminCard">
              <div className="sectionHead">
                <div>
                  <h2>Order Management</h2>
                  <p>Filter, inspect and override order states.</p>
                </div>
              </div>
              <div className="filterBar">
                <label className="filterLabel">
                  Status filter
                  <select
                    value={orderStatus}
                    onChange={(event) => {
                      setOrderPagination((prev) => ({ ...prev, page: 1 }))
                      setOrderStatus(event.target.value)
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPING">SHIPPING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </label>
                <div className="summaryLine inlineSummary"><span>Results</span><strong>{orderPagination.total}</strong></div>
              </div>
            </section>

            <section className="stack">
              {orders.map((order) => (
                <article key={order.id} className="adminCard orderCard">
                  <div className="orderHead">
                    <div>
                      <strong>{order.id}</strong>
                      <div className="muted">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <span className="pill">{order.status}</span>
                  </div>
                  <div className="orderMetaGrid">
                    <div className="orderMetaCard">
                      <span>Delivery</span>
                      <strong>{order.address}</strong>
                    </div>
                    <div className="orderMetaCard">
                      <span>Total</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
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
                    <button onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} disabled={busy || order.status === 'CONFIRMED'}>Confirm</button>
                    <button onClick={() => updateOrderStatus(order.id, 'SHIPPING')} disabled={busy || order.status === 'SHIPPING'}>Shipping</button>
                    <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} disabled={busy || order.status === 'COMPLETED'}>Complete</button>
                    <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} disabled={busy || order.status === 'CANCELLED'}>Cancel</button>
                  </div>
                </article>
              ))}
              <PaginationControls pagination={orderPagination} onChangePage={(page) => setOrderPagination((prev) => ({ ...prev, page }))} />
            </section>
          </main>
        ) : null}

        {section === 'categories' ? (
          <main className="adminContent stack">
            <section className="adminCard">
              <div className="sectionHead">
                <div>
                  <h2>Category Management</h2>
                  <p>Create, rename and remove empty categories.</p>
                </div>
              </div>
              <div className="workspaceNote">
                <div>
                  <strong>Catalog taxonomy</strong>
                  <span>These categories feed storefront filters and seller product assignment.</span>
                </div>
                <span className="pill">CRUD enabled</span>
              </div>
              <div className="inlineForm">
                <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" />
                <button onClick={() => { setCategoryName(''); setEditingCategoryId('') }}>Reset</button>
                <button className="primary" onClick={saveCategory} disabled={busy || !categoryName.trim()}>
                  {editingCategoryId ? 'Save category' : 'Create category'}
                </button>
              </div>
            </section>

            <section className="adminCard">
              <div className="tableList">
                <div className="tableRow tableHead">
                  <span>Name</span>
                  <span>Usage</span>
                  <span>Actions</span>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="tableRow categoryGridHead">
                    <div>
                      <strong>{category.name}</strong>
                    </div>
                    <span className="muted">{products.filter((product) => product.category?.id === category.id).length} products</span>
                    <div className="cardActions">
                      <button onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name) }}>Edit</button>
                      <button onClick={() => deleteCategory(category.id)} disabled={busy}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        ) : null}
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="adminCard metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PaginationControls({ pagination, onChangePage }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className="cardActions paginationBar">
      <button onClick={() => onChangePage(Math.max(1, pagination.page - 1))} disabled={pagination.page <= 1}>
        Previous
      </button>
      <span className="pill">Page {pagination.page} / {pagination.totalPages}</span>
      <button
        onClick={() => onChangePage(Math.min(pagination.totalPages, pagination.page + 1))}
        disabled={pagination.page >= pagination.totalPages}
      >
        Next
      </button>
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
