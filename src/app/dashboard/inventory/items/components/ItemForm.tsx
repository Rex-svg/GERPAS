"use client";

import React, { useEffect, useState } from "react";

type InventoryItem = {
  id?: string;
  sku?: string;
  name?: string;
  category_id?: string | null;
  unit?: string;
  min_stock?: number;
  is_active?: boolean;
};

type Props = {
  item?: InventoryItem;
  onSaved?: (item: Record<string, unknown>) => void;
  onClose?: () => void;
};

export default function ItemForm({ item, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category_id: "",
    unit: "",
    min_stock: 0,
    is_active: true,
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        sku: item.sku ?? "",
        name: item.name ?? "",
        category_id: item.category_id ?? "",
        unit: item.unit ?? "",
        min_stock: item.min_stock ?? 0,
        is_active: item.is_active ?? true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const cRes = await fetch("/api/inventory/categories");
        const cJson = await cRes.json();
        if (!mounted) return;
        setCategories(cJson.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (k: string, v: string | number | boolean) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const url = item ? `/api/inventory/items/${item.id}` : "/api/inventory/items";
      const method = item ? "PUT" : "POST";
      const payload = {
        sku: form.sku,
        name: form.name,
        category_id: form.category_id || null,
        unit: form.unit || "",
        min_stock: form.min_stock || 0,
        is_active: form.is_active,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      onSaved?.(data.item);
    } catch (err) {
      alert((err as any).message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600">SKU</label>
        <input value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} className="text-black mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Item Name</label>
        <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="text-black mt-1 w-full rounded border px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Category</label>
          <select value={form.category_id || ""} onChange={(e) => handleChange("category_id", e.target.value)} className="text-black mt-1 w-full rounded border px-3 py-2">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Unit</label>
          <input value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} className="text-black mt-1 w-full rounded border px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Status</label>
          <select value={form.is_active ? "active" : "inactive"} onChange={(e) => handleChange("is_active", e.target.value === "active")} className="text-black mt-1 w-full rounded border px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Minimum Stock</label>
          <input type="number" value={form.min_stock} onChange={(e) => handleChange("min_stock", Number(e.target.value))} className="text-black mt-1 w-full rounded border px-3 py-2" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={saving} onClick={save} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">{saving ? "Saving..." : "Save"}</button>
        <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-red-800">Cancel</button>
      </div>
    </div>
  );
}
