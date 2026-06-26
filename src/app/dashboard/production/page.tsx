"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Order, OrderStatus, ORDER_STATUSES } from "@/models/order";

const statusLabels: Record<OrderStatus, string> = {
  Pending: "Pending",
  Cutting: "Cutting",
  Sewing: "Sewing",
  Finishing: "Finishing",
  QC: "QC",
  Shipped: "Shipped",
};

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cutting":
      return "bg-blue-100 text-blue-800";
    case "Sewing":
      return "bg-purple-100 text-purple-800";
    case "Finishing":
      return "bg-indigo-100 text-indigo-800";
    case "QC":
      return "bg-orange-100 text-orange-800";
    case "Shipped":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");

  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load production orders");
        if (!mounted) return;
        setOrders(data.orders || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Unable to load production orders.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      Pending: 0,
      Cutting: 0,
      Sewing: 0,
      Finishing: 0,
      QC: 0,
      Shipped: 0,
    };

    for (const order of orders) {
      counts[order.status] += 1;
    }

    return counts;
  }, [orders]);

  const productionLines = useMemo(() => {
    const lines: Record<string, number> = {};
    orders.forEach((order) => {
      const name = order.production_line || "Unassigned";
      lines[name] = (lines[name] || 0) + 1;
    });
    return Object.entries(lines).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const dueSoon = useMemo(() => {
    return orders
      .filter((order) => order.delivery_date)
      .sort((a, b) => {
        const aDate = new Date(a.delivery_date!).getTime();
        const bDate = new Date(b.delivery_date!).getTime();
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Tracking</h1>
            <p className="text-gray-600">Monitor work-in-progress, line load, and upcoming deliveries.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders/new"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              New Order
            </Link>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition"
            >
              View Orders
            </Link>
            <Link
              href="/dashboard/production/material-usage"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Material Usage
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {(
          [
            { label: "Pending", value: statusCounts.Pending },
            { label: "Cutting", value: statusCounts.Cutting },
            { label: "Sewing", value: statusCounts.Sewing },
            { label: "Finishing", value: statusCounts.Finishing },
            { label: "QC", value: statusCounts.QC },
            { label: "Shipped", value: statusCounts.Shipped },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-4 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="flex flex-col gap-3 p-6 border-b border-gray-200 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active Production Orders</h2>
              <p className="text-sm text-gray-500">Filter by stage and review current work in progress.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("All")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === "All" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                All
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === status ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-gray-500">Loading production orders…</div>
            ) : error ? (
              <div className="p-8 text-red-600">{error}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-gray-500">No production orders match this stage.</div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Order</th>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Line</th>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Qty</th>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Delivery</th>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-5 py-4 text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-900 font-medium">{order.po_number || order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{order.production_line || "Unassigned"}</td>
                      <td className="px-5 py-4 text-sm text-gray-900">{order.quantity}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{order.delivery_date || "—"}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <Link href={`/dashboard/orders/${order.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Production Load</h3>
            <p className="text-sm text-gray-500">Orders assigned by production line.</p>
            <div className="mt-5 space-y-4">
              {productionLines.length === 0 ? (
                <div className="text-gray-500">No production lines assigned yet.</div>
              ) : (
                productionLines.slice(0, 5).map(([line, count]) => (
                  <div key={line} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{line}</p>
                      <p className="text-xs text-gray-500">Orders in progress</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Delivery</h3>
                <p className="text-sm text-gray-500">Soonest shipment and delivery dates.</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Next</span>
            </div>
            <div className="mt-5 space-y-4">
              {dueSoon.length === 0 ? (
                <div className="text-gray-500">No delivery dates scheduled.</div>
              ) : (
                dueSoon.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-gray-900">{order.po_number || order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">Deliver by {order.delivery_date}</p>
                    <p className="text-xs text-gray-500">{order.production_line || "Unassigned line"}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
