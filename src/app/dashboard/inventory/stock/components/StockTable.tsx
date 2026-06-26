"use client";

import React, { useEffect, useState } from "react";
import TransferForm from "./TransferForm";
import AdjustForm from "./AdjustForm";

type StockRow = {
  id: string;
  sku: string;
  name: string;
  warehouse_id: string;
  quantity: number;
  inventory_items?: { min_stock: number };
  warehouses?: { name: string };
};

export default function StockTable() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [transfering, setTransfering] = useState<StockRow | null>(null);
  const [adjusting, setAdjusting] = useState<StockRow | null>(null);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/stock");
      const data = (await res.json()) as { stock?: StockRow[] };
      setRows(data.stock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStock = async () => {
      await fetchStock();
    };
    void loadStock();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className=" text-black text-lg font-semibold">Stock</h3>
        <div className="text-sm text-gray-700">{rows.length} items</div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-900">Loading stock...</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-gray-900">No stock data</div>
      ) : (
        <div className="text-black overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-3">SKU</th>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Warehouse</th>
                <th className="py-2 px-3">Stock</th>
                <th className="py-2 px-3">Min</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-b hover:bg-gray-50 ${Number(r.quantity) < Number(r.inventory_items?.min_stock || 0) ? "bg-yellow-50" : ""}`}>
                  <td className="py-2 px-3">{r.sku}</td>
                  <td className="py-2 px-3">{r.name}</td>
                  <td className="py-2 px-3">{r.warehouses?.name || "—"}</td>
                  <td className="py-2 px-3">{r.quantity}</td>
                  <td className="py-2 px-3">{r.inventory_items?.min_stock ?? "—"}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => setTransfering(r)} className="px-2 py-1 rounded bg-emerald-600 text-white text-sm">Transfer</button>
                      <button onClick={() => setAdjusting(r)} className="px-2 py-1 rounded border text-sm">Adjust</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transfering && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-semibold">Transfer {transfering.name}</h4><button onClick={() => setTransfering(null)}>✕</button></div>
            <TransferForm item={transfering} onDone={() => { setTransfering(null); fetchStock(); }} onCancel={() => setTransfering(null)} />
          </div>
        </div>
      )}

      {adjusting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-semibold">Adjust {adjusting.name}</h4><button onClick={() => setAdjusting(null)}>✕</button></div>
            <AdjustForm item={adjusting} onDone={() => { setAdjusting(null); fetchStock(); }} onCancel={() => setAdjusting(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
