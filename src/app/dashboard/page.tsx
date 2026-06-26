"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";

type DashboardOrder = {
  id?: string;
  buyer_name?: string;
  quantity?: number;
  status?: string;
  created_at?: string;
  delivery_date?: string;
};

type DashboardOverview = {
  total_items?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function StatsGrid({
  loading,
  orders,
  overview,
  teamSummary,
}: {
  loading: boolean;
  orders: DashboardOrder[];
  overview: DashboardOverview | null;
  teamSummary: { totalEmployees: number } | null;
}) {
  const [now] = useState(() => Date.now());

  const activeOrders7d = useMemo(() => {
    return orders.filter((o) => {
      if (!o?.created_at) return false;
      const created = new Date(o.created_at).getTime();
      return !Number.isNaN(created) && created >= now - 7 * DAY_MS;
    }).length;
  }, [orders, now]);

  const dailyOutput2d = useMemo(() => {
    return orders.filter((o) => {
      if (!o?.delivery_date) return false;
      const delivery = new Date(o.delivery_date).getTime();
      if (Number.isNaN(delivery)) return false;
      return delivery <= now + 2 * DAY_MS && delivery >= now - DAY_MS;
    }).length;
  }, [orders, now]);

  const inventoryTotalItems = overview?.total_items ?? 0;

  const stats: Array<{ label: string; value: string | number; icon: string; fallback?: string }> = [
    { label: "Active Orders", value: loading ? "—" : activeOrders7d, icon: "📦" },
    { label: "Daily Output", value: loading ? "—" : dailyOutput2d, icon: "⚙️" },
    { label: "Team Members", value: loading ? "—" : teamSummary?.totalEmployees ?? "—", icon: "👥" },
    { label: "Inventory Value", value: loading ? "—" : inventoryTotalItems, icon: "🗳️" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <span className="text-4xl">{stat.icon}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [teamSummary, setTeamSummary] = useState<{ totalEmployees: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        const [ordersRes, overviewRes, teamRes] = await Promise.all([
          authenticatedFetch("/api/orders"),
          authenticatedFetch("/api/inventory/overview"),
          authenticatedFetch("/api/team/summary"),
        ]);

        const ordersData = await ordersRes.json();
        const overviewData = await overviewRes.json();
        const teamData = await teamRes.json();

        if (!mounted) return;
        setOrders(ordersData.orders || []);
        setOverview(overviewData);
        if (teamData?.summary?.totalEmployees !== undefined) {
          setTeamSummary({ totalEmployees: teamData.summary.totalEmployees });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadAll();
    return () => {
      mounted = false;
    };
  }, []);


  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Your Factory Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time insights and control over your entire production
        </p>
      </motion.div>

      {/* Stats Grid */}
      <StatsGrid loading={loading} orders={orders} overview={overview} teamSummary={teamSummary} />


      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders yet. Create your first order to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Buyer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 5).map((order: any) => (
                  <tr
                    key={order.id}   // ✅ FIXED (was _id)
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {order.id?.slice(-6).toUpperCase()}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.buyer_name}   {/* ✅ FIXED */}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.quantity}
                    </td>

                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Cutting"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-linear-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Create New Order</h3>
          <p className="text-emerald-100 mb-4">Add a new purchase order</p>
          <button
            onClick={() => (window.location.href = "/dashboard/orders/new")}
            className="px-4 py-2 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition"
          >
            Add Order
          </button>
        </div>

        <div className="bg-linear-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">View Production Status</h3>
          <p className="text-orange-100 mb-4">Check real-time WIP</p>
          <button
            onClick={() => (window.location.href = "/dashboard/production")}
            className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition"
          >
            View WIP
          </button>
        </div>
      </motion.div>

    </div>
  );
}