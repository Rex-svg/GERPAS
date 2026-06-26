"use client";

import React, { useEffect, useState } from "react";

type InventoryItem = { id: string; name: string; sku: string };
type Warehouse = { id: string; name: string };

type FabricRoll = {
  id: string;
  roll_number: string;
  item_id: string;
  warehouse_id: string | null;
  color: string | null;
  gsm: number | null;
  width: string | null;
  quantity_meters: number;
  received_at: string;
  inventory_items?: { name: string };
};

export default function FabricRollsTable() {
  const [rows, setRows] = useState<FabricRoll[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const fetchRolls = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/fabric-rolls");
      const data = await res.json() as { rolls?: FabricRoll[] };
      setRows(data.rolls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolls();
  }, []);

  // Load items and warehouses for dropdowns
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [iRes, wRes] = await Promise.all([
          fetch("/api/inventory/items?perPage=200"),
          fetch("/api/inventory/warehouses"),
        ]);
        const iData = await iRes.json() as { items?: InventoryItem[] };
        const wData = await wRes.json() as { warehouses?: Warehouse[] };
        if (!mounted) return;
        setItems(iData.items || []);
        setWarehouses(wData.warehouses || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const save = async (payload: Record<string, unknown>) => {
    try {
      const method = payload.id ? "PUT" : "POST";
      const url = payload.id
        ? `/api/inventory/fabric-rolls/${payload.id}`
        : "/api/inventory/fabric-rolls";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Failed to save");
      }
      fetchRolls();
      setEditing(null);
    } catch (err) {
      alert((err as Error).message || "Failed to save");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this roll?")) return;
    const res = await fetch(`/api/inventory/fabric-rolls/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete");
      return;
    }
    fetchRolls();
  };

  return (
    <div className="text-black bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fabric Rolls</h3>
        <button onClick={() => setEditing({})} className="px-3 py-2 rounded bg-emerald-600 text-white">
          Add Roll
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-gray-500">Loading fabric rolls...</div>
      ) : rows.length === 0 ? (
        <div className="py-6 text-gray-500">No rolls found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-3">Roll #</th>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Warehouse</th>
                <th className="py-2 px-3">Color</th>
                <th className="py-2 px-3">GSM</th>
                <th className="py-2 px-3">Width</th>
                <th className="py-2 px-3">Qty (m)</th>
                <th className="py-2 px-3">Received</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((roll) => (
                <tr key={roll.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{roll.roll_number}</td>
                  <td className="py-2 px-3">{roll.inventory_items?.name || "—"}</td>
                  <td className="py-2 px-3">
                    {warehouses.find((w) => w.id === roll.warehouse_id)?.name || roll.warehouse_id || "—"}
                  </td>
                  <td className="py-2 px-3">{roll.color || "—"}</td>
                  <td className="py-2 px-3">{roll.gsm || "—"}</td>
                  <td className="py-2 px-3">{roll.width || "—"}</td>
                  <td className="py-2 px-3">{roll.quantity_meters}</td>
                  <td className="py-2 px-3">
                    {roll.received_at ? new Date(roll.received_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(roll as unknown as Record<string, unknown>)} className="px-2 py-1 rounded bg-blue-600 text-white text-sm">
                        Edit
                      </button>
                      <button onClick={() => remove(roll.id)} className="px-2 py-1 rounded border text-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{editing.id ? "Edit" : "New"} Fabric Roll</h4>
              <button onClick={() => setEditing(null)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <input
                defaultValue={editing.roll_number as string}
                placeholder="Roll Number"
                onChange={(e) => setEditing((s) => ({ ...s, roll_number: e.target.value }))}
                className="w-full rounded border px-3 py-2"
              />

              <div>
                <label className="block text-sm text-gray-600 mb-1">Item</label>
                <select
                  defaultValue={editing.item_id as string}
                  onChange={(e) => setEditing((s) => ({ ...s, item_id: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">— Select Item —</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Warehouse</label>
                <select
                  defaultValue={editing.warehouse_id as string}
                  onChange={(e) => setEditing((s) => ({ ...s, warehouse_id: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">— Select Warehouse —</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                defaultValue={editing.color as string}
                placeholder="Color"
                onChange={(e) => setEditing((s) => ({ ...s, color: e.target.value }))}
                className="w-full rounded border px-3 py-2"
              />

              <div className="grid grid-cols-3 gap-3">
                <input
                  defaultValue={editing.gsm as string}
                  placeholder="GSM"
                  type="number"
                  onChange={(e) => setEditing((s) => ({ ...s, gsm: Number(e.target.value) }))}
                  className="rounded border px-3 py-2"
                />
                <input
                  defaultValue={editing.width as string}
                  placeholder="Width"
                  onChange={(e) => setEditing((s) => ({ ...s, width: e.target.value }))}
                  className="rounded border px-3 py-2"
                />
                <input
                  defaultValue={editing.quantity_meters as string}
                  placeholder="Quantity meters"
                  type="number"
                  onChange={(e) => setEditing((s) => ({ ...s, quantity_meters: Number(e.target.value) }))}
                  className="rounded border px-3 py-2"
                />
              </div>

              <input
                defaultValue={editing.received_at ? (editing.received_at as string).split("T")[0] : (editing.received_date as string)}
                type="date"
                onChange={(e) => setEditing((s) => ({ ...s, received_at: e.target.value }))}
                className="w-full rounded border px-3 py-2"
              />

              <div className="flex items-center gap-3">
                <button onClick={() => save(editing)} className="px-4 py-2 rounded bg-emerald-600 text-white">
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
