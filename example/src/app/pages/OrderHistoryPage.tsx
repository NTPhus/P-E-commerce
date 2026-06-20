import { Link } from "react-router";
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react";

const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-05-15",
    status: "Delivered",
    total: 299.99,
    items: [
      {
        name: "Wireless Headphones Pro",
        quantity: 1,
        price: 299.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-05-10",
    status: "In Transit",
    total: 399.98,
    items: [
      {
        name: "Studio Headphones",
        quantity: 2,
        price: 199.99,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "2024-05-05",
    status: "Processing",
    total: 149.99,
    items: [
      {
        name: "Bluetooth Headset",
        quantity: 1,
        price: 149.99,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
      },
    ],
  },
];

const statusConfig = {
  Delivered: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  "In Transit": {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  Processing: {
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
};

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Shop</span>
            </Link>
            <h1 className="text-2xl font-semibold text-blue-600">TechStore</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
            const statusColor = statusConfig[order.status as keyof typeof statusConfig].color;
            const statusBg = statusConfig[order.status as keyof typeof statusConfig].bg;

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="font-semibold">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusBg}`}>
                      <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                      <span className={`font-medium ${statusColor}`}>{order.status}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-4 last:mb-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        <p className="font-semibold text-blue-600 mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Order Actions */}
                  <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Track Order
                    </button>
                    <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                    {order.status === "Delivered" && (
                      <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Buy Again
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Progress */}
                {order.status !== "Delivered" && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Order Placed</p>
                            <p className="text-xs text-gray-600">{order.date}</p>
                          </div>
                        </div>
                        <div className="flex-1 h-1 bg-green-500 mx-4"></div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 ${
                              order.status === "In Transit" ? "bg-blue-500" : "bg-gray-300"
                            } rounded-full flex items-center justify-center`}
                          >
                            <Truck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">In Transit</p>
                            <p className="text-xs text-gray-600">
                              {order.status === "In Transit" ? "Now" : "Pending"}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Delivered</p>
                            <p className="text-xs text-gray-600">Pending</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
