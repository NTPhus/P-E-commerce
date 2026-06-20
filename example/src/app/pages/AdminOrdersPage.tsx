import { Link } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const orders = [
  {
    id: "ORD-2024-001",
    customer: "John Doe",
    email: "john@example.com",
    product: "Wireless Headphones Pro",
    quantity: 1,
    total: 299.99,
    status: "Completed",
    payment: "Credit Card",
    date: "2024-05-18",
    time: "10:30 AM",
  },
  {
    id: "ORD-2024-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    product: "Studio Headphones",
    quantity: 2,
    total: 399.98,
    status: "Processing",
    payment: "PayPal",
    date: "2024-05-18",
    time: "09:15 AM",
  },
  {
    id: "ORD-2024-003",
    customer: "Bob Johnson",
    email: "bob@example.com",
    product: "Bluetooth Headset",
    quantity: 1,
    total: 149.99,
    status: "Shipped",
    payment: "Credit Card",
    date: "2024-05-17",
    time: "03:45 PM",
  },
  {
    id: "ORD-2024-004",
    customer: "Alice Williams",
    email: "alice@example.com",
    product: "Pink Wireless Headphones",
    quantity: 1,
    total: 179.99,
    status: "Completed",
    payment: "Debit Card",
    date: "2024-05-17",
    time: "11:20 AM",
  },
  {
    id: "ORD-2024-005",
    customer: "Charlie Brown",
    email: "charlie@example.com",
    product: "Premium Audio Headphones",
    quantity: 1,
    total: 349.99,
    status: "Pending",
    payment: "Bank Transfer",
    date: "2024-05-16",
    time: "02:10 PM",
  },
  {
    id: "ORD-2024-006",
    customer: "Diana Prince",
    email: "diana@example.com",
    product: "Wireless Headphones Pro",
    quantity: 2,
    total: 599.98,
    status: "Cancelled",
    payment: "Credit Card",
    date: "2024-05-16",
    time: "08:30 AM",
  },
];

const statusColors = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Processing: "bg-blue-100 text-blue-700 border-blue-200",
  Shipped: "bg-purple-100 text-purple-700 border-purple-200",
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredOrders =
    filterStatus === "All" ? orders : orders.filter((order) => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-blue-600">Admin Panel</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
            <Link
              to="/admin/products"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Package className="w-5 h-5" />
              {sidebarOpen && <span>Products</span>}
            </Link>
            <Link
              to="/admin/orders"
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {sidebarOpen && <span>Orders</span>}
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              {sidebarOpen && <span>Customers</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5" />
              {sidebarOpen && <span>Analytics</span>}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              to="/login"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              {sidebarOpen && <span className="text-red-600">Logout</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer, or product..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-600">admin@techstore.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold mb-1">Order Management</h1>
                <p className="text-gray-600">View and manage all customer orders</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-5 h-5" />
                Export Orders
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Filter by Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["All", "Pending", "Processing", "Shipped", "Completed", "Cancelled"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          filterStatus === status
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-blue-600">{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-sm">{order.customer}</p>
                            <p className="text-xs text-gray-600">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{order.product}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm">{order.quantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-sm">${order.total.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              statusColors[order.status as keyof typeof statusColors]
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p>{order.date}</p>
                            <p className="text-xs text-gray-600">{order.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Order"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                      2
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                      3
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
