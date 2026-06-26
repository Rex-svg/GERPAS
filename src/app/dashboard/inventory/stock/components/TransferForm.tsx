"use client";

import React, { useEffect, useState } from "react";

export default function TransferForm({ item, onDone, onCancel }: any) {
  const [fromWarehouse, setFromWarehouse] = useState(item.warehouse_id || "");
  const [toWarehouse, setToWarehouse] = useState("");
  const [qty, setQty] = useState(0);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/inventory/warehouses").then((r) => r.json()).then((j) => { if (mounted) setWarehouses(j.warehouses || []); }).catch(()=>{});
    return () => { mounted = false; };
  }, []);

  const submit = async () => {
    if (!toWarehouse || qty <= 0) return alert("Provide destination and qty");
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/stock/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item_id: item.id, from_warehouse_id: fromWarehouse, to_warehouse_id: toWarehouse, qty, created_by: null }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onDone?.();
    } catch (err) { alert((err as any).message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="text-black space-y-3">
      <div>
        <label className="block text-sm text-gray-900">From Warehouse</label>
        <select value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
          <option value="">— Select —</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-900">To Warehouse</label>
        <select value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
          <option value="">— Select —</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-900">Quantity</label>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving} className="px-4 py-2 bg-emerald-600 text-black rounded-lg">{saving ? "Processing..." : "Transfer"}</button>
        <button onClick={onCancel} className="bg-red-600 text-white px-4 py-2 rounded-lg border">Cancel</button>
      </div>
    </div>
  );
}
