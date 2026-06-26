"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportElementToPdf, printElement } from "@/lib/exportUtils";
import { Order, OrderStatus } from "@/models/order";

type Overview = {
  total_items: number;
  total_categories: number;
  total_warehouses: number;
  total_suppliers: number;
  low_stock_count: number;
  total_stock_value: number;
  pending_purchase_orders: number;
  fabric_rolls: number;
};

type Transaction = {
  id: string;
  created_at: string;
  item_name: string;
  warehouse: string;
  type: string;
  qty: number;
  notes?: string | null;
};

const statusLabels: Record<OrderStatus, string> = {
  Pending: "Pending",
  Cutting: "Cutting",
  Sewing: "Sewing",
  Finishing: "Finishing",
  QC: "QC",
  Shipped: "Shipped",
};

const statusStyle = (status: OrderStatus) => {
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
};

export default function ReportsPage() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        const [overviewRes, ordersRes, txRes] = await Promise.all([
          fetch("/api/inventory/overview"),
          fetch("/api/orders"),
          fetch("/api/inventory/transactions?limit=20"),
        ]);

        const [overviewData, ordersData, txData] = await Promise.all([
          overviewRes.json(),
          ordersRes.json(),
          txRes.json(),
        ]);

        if (!mounted) return;
        if (!overviewRes.ok) throw new Error(overviewData?.error || "Failed to load overview");
        if (!ordersRes.ok) throw new Error(ordersData?.error || "Failed to load purchase orders");
        if (!txRes.ok) throw new Error(txData?.error || "Failed to load transactions");

        setOverview(overviewData as Overview);
        setOrders((ordersData.orders || []) as Order[]);
        setTransactions((txData.transactions || []) as Transaction[]);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Unable to load reports data.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  const orderStatusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  const exportPdf = async () => {
    if (!printRef.current) return;
    try {
      await exportElementToPdf(printRef.current, `reports_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const printPage = () => {
    if (!printRef.current) return;
    printElement(printRef.current);
  };

  const transactionTypeCounts = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  return (
    <div ref={printRef} className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Actionable inventory, orders, and production reporting in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/orders" className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition">
              View Orders
            </Link>
            <Link href="/dashboard/inventory/transactions" className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
              View Transactions
            </Link>
            <button onClick={exportPdf} className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition">
              Export PDF
            </button>
            <button onClick={printPage} className="rounded-lg bg-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Print
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Purchase Orders</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{overview ? overview.pending_purchase_orders : "—"}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Stock Value</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{overview && overview.total_stock_value != null ? `${overview.total_stock_value.toLocaleString()}` : "—"}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Recent Transactions</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{overview ? overview.low_stock_count : "—"}</p>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order & Transaction Summary</h2>
            <p className="text-sm text-gray-500">Top metrics from the last cycle.</p>
          </div>
          <div className="p-6 space-y-6">
            {error ? (
              <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
            ) : loading ? (
              <div className="text-gray-500">Loading report data…</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(orderStatusCounts).map(([status, count]) => (
                    <div key={status} className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">{statusLabels[status as OrderStatus] || status}</p>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-900">Date</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Item</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Warehouse</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Type</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 8).map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.item_name}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.warehouse}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.type}</td>
                            <td className="px-4 py-3 text-gray-700">{tx.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
            <dl className="mt-5 space-y-4 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                <dt className="text-gray-500">Items</dt>
                <dd className="font-semibold text-gray-900">{overview?.total_items ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                <dt className="text-gray-500">Categories</dt>
                <dd className="font-semibold text-gray-900">{overview?.total_categories ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                <dt className="text-gray-500">Warehouses</dt>
                <dd className="font-semibold text-gray-900">{overview?.total_warehouses ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                <dt className="text-gray-500">Fabric Rolls</dt>
                <dd className="font-semibold text-gray-900">{overview?.fabric_rolls ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Top Transaction Types</h3>
            <div className="mt-5 space-y-3">
              {Object.entries(transactionTypeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(transactionTypeCounts).length === 0 && <p className="text-sm text-gray-500">No transactions available yet.</p>}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
