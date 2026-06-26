"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Warehouse = { id: string; name: string };
type InventoryItem = { id: string; sku: string; name: string };

type TxPayload = {
  item_id: string;
  warehouse_id: string | null;
  transaction_type: string;
  quantity: number;
  purchase_order_id: string | null;
  reference_order_id: string | null;
  notes: string | null;
  unit_cost: number;
  total_cost: number;
};

const DEFAULTS = {
  transaction_type: "ADJUSTMENT",
  warehouse_id: null as string | null,
  purchase_order_id: null as string | null,
  reference_order_id: null as string | null,
  notes: null as string | null,
  unit_cost: 0,
  total_cost: 0,
};

export default function NewTransactionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [form, setForm] = useState<TxPayload>({
    item_id: "",
    warehouse_id: DEFAULTS.warehouse_id,
    transaction_type: DEFAULTS.transaction_type,
    quantity: 0,
    purchase_order_id: DEFAULTS.purchase_order_id,
    reference_order_id: DEFAULTS.reference_order_id,
    notes: DEFAULTS.notes,
    unit_cost: DEFAULTS.unit_cost,
    total_cost: DEFAULTS.total_cost,
  });

  const txTypes = useMemo(
    () => [
      "PURCHASE",
      "PRODUCTION_USE",
      "RETURN",
      "ADJUSTMENT",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "OPENING_STOCK",
    ],
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [iRes, wRes] = await Promise.all([
fetch("/api/inventory/items?limit=200"),
          fetch("/api/inventory/warehouses"),
        ]);

        // Items endpoint in this repo uses its own pagination/filters;
        // fall back to empty list if it errors.
        const iJson = await iRes.json();
        const wJson = await wRes.json();

        setItems((iJson.items || iJson.data?.items || []) as InventoryItem[]);
        setWarehouses((wJson.warehouses || []) as Warehouse[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async () => {
    if (!form.item_id) return alert("Select an item");
    if (!form.transaction_type) return alert("Select transaction type");
    if (!form.quantity || Number(form.quantity) === 0) return alert("Enter quantity");

    setSaving(true);
    try {
      const res = await fetch("/api/inventory/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create transaction");

      // API returns inserted row sometimes; otherwise refetch in list.
      if (data?.transaction?.id) {
        router.push(`/dashboard/inventory/transactions/${data.transaction.id}/report`);
      } else {
        router.push("/dashboard/inventory/transactions");
      }
    } catch (e: any) {
      alert(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">New Inventory Transaction</h1>
        <p className="text-gray-600">Create a transaction record and generate a printable report.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {loading ? (
          <div className="text-gray-500">Loading items and warehouses…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Item</label>
                <select
                  value={form.item_id}
                  onChange={(e) => setForm((s) => ({ ...s, item_id: e.target.value }))}
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                >
                  <option value="">Select item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600">Warehouse</label>
                <select
                  value={form.warehouse_id ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      warehouse_id: e.target.value ? e.target.value : null,
                    }))
                  }
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                >
                  <option value="">(optional)</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Transaction Type</label>
                <select
                  value={form.transaction_type}
                  onChange={(e) => setForm((s) => ({ ...s, transaction_type: e.target.value }))}
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                >
                  {txTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((s) => ({ ...s, quantity: Number(e.target.value) }))}
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Purchase Order ID</label>
                <input
                  value={form.purchase_order_id ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      purchase_order_id: e.target.value ? e.target.value : null,
                    }))
                  }
                  placeholder="optional"
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Reference Order ID</label>
                <input
                  value={form.reference_order_id ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      reference_order_id: e.target.value ? e.target.value : null,
                    }))
                  }
                  placeholder="optional"
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-600">Unit Cost</label>
                <input
                  type="number"
                  value={form.unit_cost}
                  onChange={(e) => setForm((s) => ({ ...s, unit_cost: Number(e.target.value) }))}
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-600">Total Cost</label>
                <input
                  type="number"
                  value={form.total_cost}
                  onChange={(e) => setForm((s) => ({ ...s, total_cost: Number(e.target.value) }))}
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-600">Notes</label>
                <input
                  value={form.notes ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value || null }))}
                  placeholder="optional"
                  className="text-black mt-1 w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={saving}
                onClick={onSubmit}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {saving ? "Saving…" : "Create Transaction"}
              </button>
              <button
                disabled={saving}
                onClick={() => router.back()}
                className="px-4 py-2 rounded-lg border bg-red-500 text-white"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

