"use client";

import React, { useEffect, useState } from "react";

type TransactionRow = {
  id: string;
  created_at: string;
  item_id: string;
  quantity: number;
  transaction_type: string;
  warehouse_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  inventory_items?: { name?: string; sku?: string };
  warehouses?: { name?: string };
  type?: string;
  qty?: number;
};

type FilterState = {
  item: string;
  warehouse: string;
  type: string;
  limit: string;
};

export default function TransactionsTable() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    item: "",
    warehouse: "",
    type: "",
    limit: "50",
  });

  const fetchTx = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(filters);
      const res = await fetch(`/api/inventory/transactions?${qs.toString()}`);
      const data = (await res.json()) as { transactions?: TransactionRow[] };
      setRows(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Inventory Transactions</h3>

        <div className="flex items-center gap-2 text-sm">
          <a
            href="/dashboard/inventory/transactions/new"
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Add Transaction
          </a>

          <button onClick={fetchTx} className="px-3 py-1 rounded bg-emerald-600 text-white">Filter</button>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-gray-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="py-6 text-gray-500">No transactions</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-black">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Item</th>
                <th className="py-2 px-3">Warehouse</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Qty</th>
                <th className="py-2 px-3">Notes</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-2 px-3">{r.inventory_items?.name || r.item_id}</td>
                  <td className="py-2 px-3">{r.warehouses?.name || r.warehouse_id || "-"}</td>
                  <td className="py-2 px-3">{r.type}</td>
                  <td className="py-2 px-3">{r.qty}</td>
                  <td className="py-2 px-3">{r.notes}</td>
                  <td className="py-2 px-3">
                    <a
                      href={`/dashboard/inventory/transactions/${r.id}/report`}
                      className="px-2 py-1 rounded bg-emerald-600 text-white text-sm inline-block"
                    >
                      Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
