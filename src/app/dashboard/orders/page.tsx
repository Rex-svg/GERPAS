"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/models/order";

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "Pending", label: "Pending" },
  { key: "Cutting", label: "Cutting" },
  { key: "Sewing", label: "Sewing" },
  { key: "Finishing", label: "Finishing" },
  { key: "QC", label: "QC" },
  { key: "Shipped", label: "Shipped" },
];

function statusPillClass(status: OrderStatus) {
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
      return "bg-emerald-100 text-emerald-800";
  }
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  async function fetchOrders() {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    setOrders((data.orders as Order[]) || []);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await fetchOrders();
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const metrics = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      Pending: 0,
      Cutting: 0,
      Sewing: 0,
      Finishing: 0,
      QC: 0,
      Shipped: 0,
    };
    for (const o of orders) counts[o.status] += 1;

    return {
      total: orders.length,
      ...counts,
    };
  }, [orders]);

  const handleCreateOrder = () => {
    router.push("/dashboard/orders/new");
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all purchase orders</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateOrder}
          className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          + New Order
        </motion.button>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {(
          [
            { label: "Total Orders", value: metrics.total },
            { label: "Pending Orders", value: metrics.Pending },
            { label: "Cutting Orders", value: metrics.Cutting },
            { label: "Sewing Orders", value: metrics.Sewing },
            { label: "Finishing Orders", value: metrics.Finishing },
            { label: "QC Orders", value: metrics.QC },
            { label: "Shipped Orders", value: metrics.Shipped },
          ] as const
        ).map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
          >
            <p className="text-xs font-medium text-gray-500">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f.key
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-emerald-600"
            }`}
          >
            {f.label}
          </button>
        ))}

        <div className="ml-auto text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredOrders.length}
          </span>{" "}
          / <span className="font-semibold text-gray-900">{metrics.total}</span>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin mb-4">⏳</div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="mb-4">
              {filter === "all"
                ? "Get started by creating your first order"
                : `No ${filter} orders match your filter`}
            </p>
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Create Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Style Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                      {order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.buyer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.style_code || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusPillClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
