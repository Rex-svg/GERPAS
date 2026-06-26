"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ReceiveMaterialsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [itemId, setItemId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [itemsRes, warehousesRes, ordersRes] = await Promise.all([
          fetch("/api/inventory/items"),
          fetch("/api/inventory/warehouses"),
          fetch("/api/orders"),
        ]);

        const [itemsData, warehousesData, ordersData] = await Promise.all([
          itemsRes.json(),
          warehousesRes.json(),
          ordersRes.json(),
        ]);

        if (!mounted) return;
        setItems(itemsData.items || []);
        setWarehouses(warehousesData.warehouses || []);
        setOrders(ordersData.orders || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load receive form data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemId || !warehouseId || !quantity) {
      setError("Please select an item, warehouse, and quantity.");
      return;
    }

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/purchase-orders/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          warehouse_id: warehouseId,
          qty,
          notes: notes || null,
          order_id: orderId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to receive materials");

      setSuccess("Materials received successfully.");
      setItemId("");
      setWarehouseId("");
      setQuantity("");
      setNotes("");
      setOrderId("");
      setTimeout(() => router.push("/dashboard/inventory/stock"), 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to receive materials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Receive Materials</h1>
        <p className="text-gray-600 mt-1">Log incoming materials into inventory and attach them to a purchase order.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {loading ? (
            <div className="text-gray-500">Loading receive form…</div>
          ) : (
            <>
              {(error || success) && (
                <div className={`rounded-lg p-4 ${error ? "bg-red-50 border border-red-200 text-red-700" : "bg-emerald-50 border border-emerald-200 text-emerald-900"}`}>
                  {error || success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Item</label>
                  <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select an item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name || item.sku || item.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Warehouse</label>
                  <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select a warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Linked Purchase Order</label>
                  <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Optional purchase order</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>{order.po_number ? `${order.po_number} — ${order.buyer_name}` : `${order.id.slice(-6).toUpperCase()} — ${order.buyer_name}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  Receiving materials adds a purchase transaction and adjusts stock levels immediately.
                </div>
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition">
                  {submitting ? "Receiving…" : "Receive Materials"}
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
