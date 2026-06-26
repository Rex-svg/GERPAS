"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/models/order";

const statusLabels: Record<OrderStatus, string> = {
  Pending: "Pending",
  Cutting: "Cutting",
  Sewing: "Sewing",
  Finishing: "Finishing",
  QC: "QC",
  Shipped: "Shipped",
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load purchase orders");
        if (mounted) setOrders(data.orders || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load purchase orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totals: Record<OrderStatus, number> = {
      Pending: 0,
      Cutting: 0,
      Sewing: 0,
      Finishing: 0,
      QC: 0,
      Shipped: 0,
    };

    for (const order of orders) {
      totals[order.status] += 1;
    }

    return {
      total: orders.length,
      ...totals,
    };
  }, [orders]);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600">Track purchase order status, create new POs, and receive materials.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard/orders/new" className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition">
              New Purchase Order
            </Link>
            <Link href="/dashboard/purchase-orders/receive" className="px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition">
              Receive Materials
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(
          [
            { label: "Total POs", value: metrics.total },
            { label: "Pending", value: metrics.Pending },
            { label: "Cutting", value: metrics.Cutting },
            { label: "Shipped", value: metrics.Shipped },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h2>
            <p className="text-sm text-gray-500">Review the most recent purchase orders created by your team.</p>
          </div>
          <div className="text-sm text-gray-500">{orders.length} total</div>
        </div>

        {loading ? (
          <div className="p-8 text-gray-500">Loading purchase orders…</div>
        ) : error ? (
          <div className="p-8 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-gray-500">No purchase orders found. Start by creating a new PO.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Order</th>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Buyer</th>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Style</th>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Qty</th>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-900 font-semibold">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.buyer_name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.style_code || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{order.quantity}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
          </div>
        )}
      </motion.div>
    </div>
  );
}
