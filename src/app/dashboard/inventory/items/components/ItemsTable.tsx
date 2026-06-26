"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../../../../lib/supabase";
import ItemForm from "./ItemForm";

type ItemsTableProps = {
  autoOpenNew?: boolean;
};

type InventoryCategory = {
  id: string;
  name: string;
};

type Warehouse = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  status: string;
  updated_at: string;
  inventory_stock?: { quantity: number; warehouse_id: string }[];
};

export default function ItemsTable({ autoOpenNew = false }: ItemsTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [editing, setEditing] = useState<InventoryItem | Record<string, unknown> | null>(autoOpenNew ? ({} as InventoryItem) : null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ search, page: String(page), perPage: String(perPage) });
      if (selectedCategory) qs.set("category", selectedCategory);
      if (selectedWarehouse) qs.set("warehouse", selectedWarehouse);
      if (lowStockOnly) qs.set("lowStock", "true");
      const res = await fetch(`/api/inventory/items?${qs.toString()}`);
      const data = (await res.json()) as { items?: InventoryItem[] };
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadItems = async () => {
      await fetchItems();
    };
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Supabase realtime subscription: refresh on changes
  useEffect(() => {
    const channel = supabase
      .channel("public:inventory_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_items" },
        () => {
          // simple strategy: refetch current page when anything changes
          void fetchItems();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedWarehouse, lowStockOnly, search, page]);

  useEffect(() => {
    let mounted = true;
    const loadFilters = async () => {
      try {
        const [cRes, wRes] = await Promise.all([fetch("/api/inventory/categories"), fetch("/api/inventory/warehouses")]);
        const cJson = (await cRes.json()) as { categories?: InventoryCategory[] };
        const wJson = (await wRes.json()) as { warehouses?: Warehouse[] };
        if (!mounted) return;
        setCategories(cJson.categories || []);
        setWarehouses(wJson.warehouses || []);
      } catch (err) {
        console.error(err);
      }
    };
    void loadFilters();
    return () => { mounted = false; };
  }, []);

  const openNew = () => setEditing({});

  const handleSaved = (_item?: Record<string, unknown>) => {
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/inventory/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Failed to delete");
    }
  };

  const exportCSV = () => {
    const headers = ["SKU", "Item Name", "Unit", "Current Stock", "Min Stock", "Status"];
    const rows = items.map((it) => [it.sku, it.name, it.unit, it.current_stock, it.min_stock, it.status]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_items_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input placeholder="Search SKU or name" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border px-3 py-2 border- border-e-black text-gray-800" />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded border px-3 py-2 border- border-e-black text-gray-800">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="rounded border px-3 py-2 border- border-e-black text-gray-800">
            <option value="">All warehouses</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <label className="flex items-center gap-2 border- border-e-black text-gray-800"><input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} /> Low stock</label>
          <button onClick={() => { setPage(1); fetchItems(); }} className="px-3 py-2 border- border-e-black rounded bg-emerald-600 text-white">Search</button>
          <button onClick={() => { setSearch(""); setSelectedCategory(""); setSelectedWarehouse(""); setLowStockOnly(false); setPage(1); fetchItems(); }} className="px-3 py-2 border- bg-red-800 text-white rounded border">Clear</button>
        </div>

        <div className="flex items-center gap-2 border- border-e-black text-gray-800">
          <button onClick={openNew} className="px-3 py-2 border- rounded bg-blue-600 text-white">Add Item</button>
          <button onClick={exportCSV} className="px-3 py-2 border- border-e-black text-gray-800 rounded border">Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No items found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">SKU</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Item Name</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Unit</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Current Stock</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Min Stock</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Status</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Last Updated</th>
                <th className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className={`border-b hover:bg-gray-50 ${Number(it.current_stock) < Number(it.min_stock) ? "bg-yellow-50" : ""}`}>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm font-medium">{it.sku}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{it.name}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{it.unit}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{it.current_stock}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{it.min_stock}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{it.status}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">{new Date(it.updated_at).toLocaleString()}</td>
                  <td className="py-2 border- border-e-black text-gray-800 px-3 text-sm">
                    <div className="flex items-center gap-2 border- border-e-black text-gray-800">
                      <button onClick={() => setEditing(it)} className="px-2 border- border-e-black py-1 rounded bg-emerald-600 text-white text-sm">Edit</button>
                      <button onClick={() => handleDelete(it.id)} className="px-2 border- bg-red-700 text-gray-800 py-1 rounded border text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page}</div>
        <div className="flex items-center gap-2 border- border-e-black text-gray-800">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border">Next</button>
        </div>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold  text-black">{editing?.id ? "Edit Item" : "New Item"}</h4>
              <button onClick={() => setEditing(null)} className="text-gray-500">✕</button>
            </div>
            <ItemForm item={editing?.id ? editing : undefined} onSaved={handleSaved} onClose={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
