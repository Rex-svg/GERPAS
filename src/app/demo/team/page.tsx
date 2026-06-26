"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoTeamPage() {
  const team = [
    {
      id: 1,
      name: "Ahmed Hassan",
      role: "Factory Manager",
      email: "ahmed@factory.com",
      status: "Online",
      icon: "👨‍💼",
      tasks: 12,
    },
    {
      id: 2,
      name: "Fatima Khan",
      role: "Production Lead",
      email: "fatima@factory.com",
      status: "Online",
      icon: "👩‍🔧",
      tasks: 8,
    },
    {
      id: 3,
      name: "Mohammad Ali",
      role: "Quality Manager",
      email: "ali@factory.com",
      status: "Offline",
      icon: "👨‍💻",
      tasks: 5,
    },
    {
      id: 4,
      name: "Zainab Ahmed",
      role: "Inventory Officer",
      email: "zainab@factory.com",
      status: "Online",
      icon: "👩‍💼",
      tasks: 15,
    },
    {
      id: 5,
      name: "Hassan Mahmoud",
      role: "Shipping Coordinator",
      email: "hassan@factory.com",
      status: "Online",
      icon: "👨‍✈️",
      tasks: 9,
    },
    {
      id: 6,
      name: "Amira Hassan",
      role: "HR Manager",
      email: "amira@factory.com",
      status: "In Meeting",
      icon: "👩‍💼",
      tasks: 6,
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
            { label: "Production", href: "/demo/production", icon: "⚙️" },
            { label: "Team", href: "/demo/team", icon: "👥", active: true },
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
          className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-8 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="font-semibold text-blue-900">Demo Mode</p>
              <p className="text-sm text-blue-700">Exploring Team Management</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium opacity-60 cursor-not-allowed">
              + Invite Member
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
                { label: "Team Members", value: "6", icon: "👥" },
                { label: "Online Now", value: "5", icon: "🟢" },
                { label: "Pending Tasks", value: "55", icon: "📋" },
                { label: "Completed", value: "248", icon: "✅" },
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

            {/* Team Members Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Team Members
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-lg shadow p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{member.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <span
                        className={`w-3 h-3 rounded-full ${
                          member.status === "Online"
                            ? "bg-green-500"
                            : member.status === "In Meeting"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {member.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="text-emerald-600 font-medium">
                          {member.status}
                        </span>
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Active Tasks
                        </span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                          {member.tasks}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity & Assignments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      user: "Zainab Ahmed",
                      action: "Updated inventory count",
                      time: "5 min ago",
                    },
                    {
                      user: "Ahmed Hassan",
                      action: "Approved order #ORD-002",
                      time: "15 min ago",
                    },
                    {
                      user: "Fatima Khan",
                      action: "Started production on Line B",
                      time: "30 min ago",
                    },
                    {
                      user: "Hassan Mahmoud",
                      action: "Shipped order #ORD-001",
                      time: "1 hour ago",
                    },
                  ].map((activity, idx) => (
                    <div
                      key={idx}
                      className="pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Task Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { role: "Inventory Officer", tasks: 15, color: "bg-emerald-600" },
                    { role: "Factory Manager", tasks: 12, color: "bg-blue-600" },
                    { role: "Shipping Coord.", tasks: 9, color: "bg-purple-600" },
                    { role: "Production Lead", tasks: 8, color: "bg-orange-600" },
                    { role: "HR Manager", tasks: 6, color: "bg-pink-600" },
                  ].map((item) => (
                    <div key={item.role}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {item.role}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.tasks}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${(item.tasks / 15) * 100}%` }}
                        ></div>
                      </div>
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
