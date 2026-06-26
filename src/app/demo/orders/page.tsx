"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoOrdersPage() {
  const orders = [
    {
      id: "ORD-001",
      customer: "Global Fashion Co.",
      items: "500 Cotton T-Shirts",
      status: "In Production",
      progress: 65,
      dueDate: "Apr 25, 2026",
      icon: "🟢",
    },
    {
      id: "ORD-002",
      customer: "Premium Apparel Ltd.",
      items: "1,200 Denim Jeans",
      status: "Quality Check",
      progress: 90,
      dueDate: "Apr 22, 2026",
      icon: "🟡",
    },
    {
      id: "ORD-003",
      customer: "Sustainable Wear",
      items: "750 Organic Shirts",
      status: "Completed",
      progress: 100,
      dueDate: "Apr 18, 2026",
      icon: "✅",
    },
    {
      id: "ORD-004",
      customer: "Urban Threads",
      items: "300 Hoodies",
      status: "Cutting",
      progress: 35,
      dueDate: "May 2, 2026",
      icon: "🔵",
    },
    {
      id: "ORD-005",
      customer: "Eco Fashion",
      items: "2,000 Leggings",
      status: "Pending",
      progress: 0,
      dueDate: "May 5, 2026",
      icon: "⚪",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-white shadow-lg flex flex-col"
      >
        <div className="p-6 border-b border-gray-200">
          <Link href="/demo" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-lg text-gray-900">GERPAS</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: "Overview", href: "/demo", icon: "📊" },
            { label: "Orders", href: "/demo/orders", icon: "📦", active: true },
            { label: "Inventory", href: "/demo/inventory", icon: "📊" },
            { label: "Production", href: "/demo/production", icon: "⚙️" },
            { label: "Team", href: "/demo/team", icon: "👥" },
            { label: "Settings", href: "#", icon: "⚙️" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active
                  ? "bg-emerald-100 text-emerald-700 font-semibold"
                  : "text-gray-700 hover:bg-emerald-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Demo Banner */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-8 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="font-semibold text-blue-900">Demo Mode</p>
              <p className="text-sm text-blue-700">
                Exploring Orders Management
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Start Free Trial
          </Link>
        </motion.div>

        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-sm px-8 py-4 flex items-center justify-between border-b border-gray-200"
        >
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium opacity-60 cursor-not-allowed">
              + New Order
            </button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Orders", value: "487", icon: "📦" },
                { label: "In Progress", value: "24", icon: "⚙️" },
                { label: "Completed", value: "451", icon: "✅" },
                { label: "Revenue", value: "$2.4M", icon: "💰" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Orders
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="border-b border-gray-200 transition-all"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                            {order.icon} {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 mt-1 inline-block">
                            {order.progress}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.dueDate}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Status Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Completed", count: 451, color: "bg-green-500" },
                    { label: "In Production", count: 24, color: "bg-blue-500" },
                    { label: "Quality Check", count: 8, color: "bg-yellow-500" },
                    { label: "Pending", count: 4, color: "bg-gray-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {item.label}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Top Customers
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Global Fashion Co.", orders: 45, revenue: "$450K" },
                    {
                      name: "Premium Apparel Ltd.",
                      orders: 38,
                      revenue: "$380K",
                    },
                    {
                      name: "Sustainable Wear",
                      orders: 32,
                      revenue: "$320K",
                    },
                    {
                      name: "Urban Threads",
                      orders: 28,
                      revenue: "$280K",
                    },
                  ].map((customer) => (
                    <div
                      key={customer.name}
                      className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.orders} orders
                        </p>
                      </div>
                      <p className="font-bold text-emerald-600">
                        {customer.revenue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
