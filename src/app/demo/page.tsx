"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { label } from "framer-motion/client";

export default function DemoPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-white shadow-lg flex flex-col"
      >
        {/* Logo */}
        <Link href="/" className="p-6 border-b border-gray-200 hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hover:text-emerald-600 transition">GERPAS</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: "Overview", href: "/demo", icon: "📊", active: true },
            { label: "Orders", href: "/demo/orders", icon: "📦" },
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Home
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
                You're exploring as a guest with all features unlocked
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              🔔
            </button>
            <div className="flex flex-col items-end">
              <div className="text-sm font-medium text-gray-900">Demo User</div>
              <div className="text-xs text-gray-500">demo@gerpas.example</div>
            </div>
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
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to GERPAS Demo
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Explore the features of our garment factory management platform. This
                is a fully functional demo showcasing all capabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Total Orders", value: "1,234", icon: "📦" },
                  { title: "Inventory Items", value: "5,678", icon: "📊" },
                  {
                    title: "Production Queue",
                    value: "342",
                    icon: "⚙️",
                  },
                  { title: "Team Members", value: "12", icon: "👥" },
                ].map((stat) => (
                  <div
                    key={stat.title}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-sm text-gray-600">{stat.title}</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: "Order Management",
                  description:
                    "Create, track, and manage orders with real-time updates",
                  items: ["✓ Order tracking", "✓ Status updates", "✓ Export data"],
                },
                {
                  title: "Inventory Management",
                  description:
                    "Keep your inventory in sync across all locations",
                  items: [
                    "✓ Stock monitoring",
                    "✓ Reorder alerts",
                    "✓ Multi-location",
                  ],
                },
                {
                  title: "Production Scheduling",
                  description: "Schedule and optimize your production workflow",
                  items: ["✓ Timeline planning", "✓ Resource allocation", "✓ Analytics"],
                },
                {
                  title: "Team Collaboration",
                  description: "Collaborate with your team in real-time",
                  items: ["✓ Assignments", "✓ Notifications", "✓ Reports"],
                },
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-emerald-300 transition-all"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.items.map((item) => (
                      <li key={item} className="text-sm text-emerald-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  {
                    event: "Order #1001 shipped",
                    time: "2 hours ago",
                    icon: "📦",
                  },
                  {
                    event: "Inventory updated",
                    time: "4 hours ago",
                    icon: "📊",
                  },
                  {
                    event: "New team member added",
                    time: "1 day ago",
                    icon: "👥",
                  },
                  {
                    event: "Production milestone reached",
                    time: "2 days ago",
                    icon: "✅",
                  },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {activity.event}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-linear-to-r from-emerald-600 to-teal-600 rounded-lg shadow-lg p-8 text-white text-center"
            >
              <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
              <p className="mb-6 text-emerald-100">
                Start your free 3-day trial and get full access to all features
              </p>
              <Link
                href="/register"
                className="inline-block px-8 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-all"
              >
                Start Free Trial →
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
