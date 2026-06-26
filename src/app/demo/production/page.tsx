"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoProductionPage() {
  const productionLines = [
    {
      id: "LINE-001",
      name: "Line A",
      current: "ORD-001 (T-Shirts)",
      progress: 65,
      status: "Running",
      efficiency: 92,
      icon: "🟢",
    },
    {
      id: "LINE-002",
      name: "Line B",
      current: "ORD-002 (Jeans)",
      progress: 45,
      status: "Running",
      efficiency: 88,
      icon: "🟢",
    },
    {
      id: "LINE-003",
      name: "Line C",
      current: "QC - ORD-003",
      progress: 100,
      status: "Quality Check",
      efficiency: 95,
      icon: "🟡",
    },
    {
      id: "LINE-004",
      name: "Line D",
      current: "Idle",
      progress: 0,
      status: "Maintenance",
      efficiency: 0,
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
            { label: "Orders", href: "/demo/orders", icon: "📦" },
            { label: "Inventory", href: "/demo/inventory", icon: "📊" },
            {
              label: "Production",
              href: "/demo/production",
              icon: "⚙️",
              active: true,
            },
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
              <p className="text-sm text-blue-700">Exploring Production Management</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium opacity-60 cursor-not-allowed">
              + Schedule Line
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
                { label: "Lines Active", value: "3/4", icon: "🟢" },
                { label: "Avg Efficiency", value: "91.7%", icon: "📈" },
                { label: "Daily Output", value: "2,450 units", icon: "📦" },
                { label: "Issues", value: "2", icon: "⚠️" },
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

            {/* Production Lines */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900">Production Lines</h2>
              {productionLines.map((line) => (
                <motion.div
                  key={line.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{line.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{line.name}</h3>
                        <p className="text-sm text-gray-600">{line.current}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-medium text-sm ${
                        line.status === "Running"
                          ? "bg-green-100 text-green-700"
                          : line.status === "Quality Check"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {line.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${line.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Efficiency</span>
                        <span className="text-sm font-bold text-blue-600">
                          {line.efficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${line.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Weekly Output
                </h3>
                <div className="space-y-3">
                  {[
                    { day: "Monday", units: 2200 },
                    { day: "Tuesday", units: 2450 },
                    { day: "Wednesday", units: 2100 },
                    { day: "Thursday", units: 2380 },
                    { day: "Friday", units: 2600 },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900 w-24">
                        {day.day}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${(day.units / 2600) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-12">
                        {day.units}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Production Issues
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      issue: "Line D: Maintenance scheduled",
                      severity: "Medium",
                      time: "In Progress",
                    },
                    {
                      issue: "Button shortage on Line B",
                      severity: "High",
                      time: "2 hours ago",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{item.issue}</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.severity === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{item.time}</p>
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
