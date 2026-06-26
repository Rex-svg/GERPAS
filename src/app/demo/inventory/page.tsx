"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoInventoryPage() {
  const inventory = [
    {
      id: "INV-001",
      item: "Cotton Fabric (White)",
      sku: "COT-W-100",
      stock: 5200,
      unit: "meters",
      status: "Good",
      reorder: 2000,
      icon: "🟢",
    },
    {
      id: "INV-002",
      item: "Denim Fabric (Blue)",
      sku: "DEN-B-150",
      stock: 1800,
      unit: "meters",
      status: "Low",
      reorder: 3000,
      icon: "🟡",
    },
    {
      id: "INV-003",
      item: "Buttons (Metal)",
      sku: "BTN-M-001",
      stock: 45000,
      unit: "pieces",
      status: "Good",
      reorder: 10000,
      icon: "🟢",
    },
    {
      id: "INV-004",
      item: "Zippers (YKK)",
      sku: "ZIP-Y-200",
      stock: 3200,
      unit: "pieces",
      status: "Critical",
      reorder: 5000,
      icon: "🔴",
    },
    {
      id: "INV-005",
      item: "Thread (Polyester)",
      sku: "THR-P-500",
      stock: 8500,
      unit: "spools",
      status: "Good",
      reorder: 2000,
      icon: "🟢",
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
            { label: "Orders", href: "/demo/orders", icon: "📦" },
            {
              label: "Inventory",
              href: "/demo/inventory",
              icon: "📊",
              active: true,
            },
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
              <p className="text-sm text-blue-700">Exploring Inventory Management</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search items..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled
            />
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
                { label: "Total Items", value: "63,700", icon: "📦" },
                { label: "Low Stock", value: "3", icon: "⚠️" },
                { label: "Critical", value: "1", icon: "🔴" },
                { label: "Last Updated", value: "2 min ago", icon: "🕐" },
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

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Stock Levels
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Reorder Level
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <motion.tr
                        key={item.id}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        className="border-b border-gray-200 transition-all"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.item}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {item.stock.toLocaleString()} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.reorder.toLocaleString()} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${
                              item.status === "Good"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Low"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.icon} {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Stock Distribution by Category
                </h3>
                <div className="space-y-3">
                  {[
                    { category: "Fabrics", percentage: 45 },
                    { category: "Fasteners", percentage: 30 },
                    { category: "Thread & Notions", percentage: 15 },
                    { category: "Packaging", percentage: 10 },
                  ].map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {cat.category}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {cat.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Movements
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      action: "Cotton Fabric received",
                      qty: "+2,000 meters",
                      time: "2 hours ago",
                    },
                    {
                      action: "Buttons allocated",
                      qty: "-5,000 pieces",
                      time: "4 hours ago",
                    },
                    {
                      action: "Thread restocked",
                      qty: "+1,500 spools",
                      time: "1 day ago",
                    },
                    {
                      action: "Zippers used",
                      qty: "-800 pieces",
                      time: "2 days ago",
                    },
                  ].map((movement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.action}
                        </p>
                        <p className="text-sm text-gray-500">{movement.time}</p>
                      </div>
                      <p className="font-bold text-emerald-600">
                        {movement.qty}
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
