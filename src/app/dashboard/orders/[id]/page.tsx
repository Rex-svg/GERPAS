"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Order, OrderStatus, ORDER_STATUSES } from "@/models/order";

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

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch order");
        if (mounted) setOrder(data.order as Order);
      } catch (e: any) {
        console.error(e);
        if (mounted) setToast({ type: "error", msg: e?.message || "Failed to load order" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const totalValue = useMemo(() => {
    if (!order) return 0;
    return Number(order.quantity) * Number(order.unit_price);
  }, [order]);

  async function patchStatus(nextStatus: OrderStatus) {
    if (!id) return;
    if (!order) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update status");

      setOrder(data.order as Order);
      setToast({ type: "success", msg: "Status updated successfully" });
    } catch (e: any) {
      console.error(e);
      setToast({ type: "error", msg: e?.message || "Failed to update status" });
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const confirmed = window.confirm("Delete this order? This action cannot be undone.");
    if (!confirmed) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete order");

      setToast({ type: "success", msg: "Order deleted" });
      router.push("/dashboard/orders");
      router.refresh?.();
    } catch (e: any) {
      console.error(e);
      setToast({ type: "error", msg: e?.message || "Failed to delete order" });
    } finally {
      setSubmittingDelete(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1">Production & commercial summary</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition"
          >
            ← Back
          </button>
        </div>
      </motion.div>

      {toast && (
        <div
          className={`rounded-lg border p-4 ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role="status"
        >
          {toast.msg}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        ) : !order ? (
          <div className="p-8 text-gray-600">Order not found.</div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-semibold text-emerald-700">
                  {order.id.slice(-10).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/orders/${order.id}/report`}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition font-medium"
                >
                  Generate Report
                </Link>

                <Link
                  href={`/dashboard/orders/${order.id}/edit`}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition font-medium"
                >
                  Edit Order
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={submittingDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submittingDelete ? "Deleting..." : "Delete Order"}
                </button>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500">Buyer Name</div>
                  <div className="font-semibold text-gray-900">{order.buyer_name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">PO Number</div>
                  <div className="text-gray-900">{order.po_number || "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Buyer Country</div>
                  <div className="text-gray-900">{order.buyer_country || "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Style Code</div>
                  <div className="text-gray-900">{order.style_code}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Production Line</div>
                  <div className="text-gray-900">{order.production_line || "—"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500">Quantity</div>
                  <div className="text-gray-900 font-semibold">{order.quantity}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Color / Size</div>
                  <div className="text-gray-900">
                    {(order.color || "—") + " • " + (order.size || "—")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Fabric</div>
                  <div className="text-gray-900">{order.fabric || "—"}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Unit Price</div>
                  <div className="text-gray-900">{order.unit_price?.toString?.() ?? String(order.unit_price)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Total Value</div>
                    <div className="text-gray-800 hover:text-emerald-700 font-bold">                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "BDT",
                      maximumFractionDigits: 2,
                    }).format(totalValue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial & production */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">Status & Dates</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-gray-900">Status</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusPillClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-3">
                        <label className="text-xs font-medium text-gray-600">Change Status</label>
                        <select
                          value={order.status}
                          onChange={(e) => patchStatus(e.target.value as OrderStatus)}
                          disabled={updatingStatus}
                          className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500">Order Date</div>
                        <div className="text-gray-900">{order.order_date || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Delivery Date</div>
                        <div className="text-gray-900">{order.delivery_date || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Shipment Date</div>
                        <div className="text-gray-900">{order.shipment_date || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 h-fit">
                <div className="text-xs font-medium text-gray-500 mb-2">Remarks</div>
                <div className="text-gray-900 whitespace-pre-wrap">
                  {order.remarks || "—"}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
