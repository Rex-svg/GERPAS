"use client";

import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import { useDragSidebar } from "@/lib/dragSidebar";


const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/orders", label: "Orders", icon: "📦" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/inventory/finished-goods", label: "Finished Goods", icon: "🏷️" },
  { href: "/dashboard/inventory/warehouses", label: "Warehouses", icon: "🏬" },
  { href: "/dashboard/inventory/transactions", label: "Transactions", icon: "📝" },
  { href: "/dashboard/inventory/fabric-rolls", label: "Fabric Rolls", icon: "🧵" },
  { href: "/dashboard/production", label: "Production", icon: "⚙️" },
  { href: "/dashboard/production/material-usage", label: "Material Usage", icon: "🧾" },
  { href: "/dashboard/reports", label: "Reports", icon: "📈" },
  { href: "/dashboard/team", label: "Team", icon: "👥" },
  { href: "/dashboard/finance", label: "Finance", icon: "💰" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useUser();
  const [factoryName, setFactoryName] = useState("Dashboard");
  const router = useRouter();

  useEffect(() => {
    authenticatedFetch("/api/factory")
      .then((res) => res.json())
      .then((data) => {
        if (data?.factory?.name) setFactoryName(data.factory.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  const { ref, topOffset } = useDragSidebar();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        ref={ref}
        style={{ transform: `translateY(${topOffset}px)` }}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-white shadow-lg flex flex-col will-change-transform"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-lg text-gray-900">GERPAS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {/* intentionally blank: sign out moved to top right under email */}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Guest Banner */}
        {user?.isGuest && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-8 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👤</span>
              <div>
                <p className="font-semibold text-blue-900">Demo Mode</p>
                <p className="text-sm text-blue-700">You&apos;re exploring as a guest with limited features</p>
              </div>
            </div>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Start Free Trial
            </Link>
          </motion.div>
        )}

        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-sm px-8 py-4 flex items-center justify-between border-b border-gray-200"
        >
          <h1 className="text-2xl font-bold text-gray-900">{factoryName}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              🔔
            </button>
            <div className="flex flex-col items-end">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-3">
                <span>{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
