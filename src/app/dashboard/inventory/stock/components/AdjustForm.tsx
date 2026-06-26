"use client";

import React, { useState } from "react";

export default function AdjustForm({ item, onDone, onCancel }: any) {
  const [qty, setQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (qty === 0) return alert("Enter adjustment quantity (positive or negative)");
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/stock/adjust", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item_id: item.id, warehouse_id: item.warehouse_id, qty, notes, created_by: null }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onDone?.();
    } catch (err) { alert((err as any).message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="text-black space-y-3">
      <div>
        <label className="block text-sm text-gray-900">Adjustment Quantity</label>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className=" text-black mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-gray-900">Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className=" text-black mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">{saving ? "Saving..." : "Apply"}</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border bg-red-500 text-white">Cancel</button>
      </div>
    </div>
  );
}
