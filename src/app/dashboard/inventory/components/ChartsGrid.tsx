"use client";

import React, { useEffect, useState } from "react";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  current_stock?: number;
  updated_at: string;
};

type FabricRoll = {
  id: string;
  roll_number: string | null;
  quantity_meters: number;
  received_at: string;
  inventory_items?: { name: string } | null;
};

export default function ChartsGrid() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [rolls, setRolls] = useState<FabricRoll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [itemsRes, rollsRes] = await Promise.all([
          fetch("/api/inventory/items?perPage=5"),
          fetch("/api/inventory/fabric-rolls"),
        ]);

        if (!itemsRes.ok) throw new Error("Failed to load recent items");
        if (!rollsRes.ok) throw new Error("Failed to load fabric rolls");

        const itemsData = await itemsRes.json();
        const rollsData = await rollsRes.json();

        if (!mounted) return;

        setItems(itemsData.items || []);
        setRolls((rollsData.rolls || []).slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItemRow = (item: InventoryItem) => (
    <li key={item.id} className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-emerald-600">{item.current_stock ?? 0}</p>
        <p className="text-xs text-gray-500">{new Date(item.updated_at).toLocaleDateString()}</p>
      </div>
    </li>
  );

  const renderRollRow = (roll: FabricRoll) => (
    <li key={roll.id} className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{roll.inventory_items?.name || "Unknown item"}</p>
        <p className="text-xs text-gray-500">Roll {roll.roll_number || "—"}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-slate-700">{roll.quantity_meters} m</p>
        <p className="text-xs text-gray-500">{new Date(roll.received_at).toLocaleDateString()}</p>
      </div>
    </li>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Inventory Additions</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Newly Added Items</p>
              <p className="text-2xl font-semibold text-gray-900">Latest items</p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
              {loading ? "..." : `${items.length}`}
            </span>
          </div>
          <ul className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className="h-16 rounded-lg bg-white animate-pulse" />
              ))
            ) : items.length > 0 ? (
              items.map(renderItemRow)
            ) : (
              <li className="text-sm text-gray-500">No recently added items.</li>
            )}
          </ul>
        </div>

        <div className="p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">New Fabric Rolls</p>
              <p className="text-2xl font-semibold text-gray-900">Latest rolls</p>
            </div>
            <span className="rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold">
              {loading ? "..." : `${rolls.length}`}
            </span>
          </div>
          <ul className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className="h-16 rounded-lg bg-white animate-pulse" />
              ))
            ) : rolls.length > 0 ? (
              rolls.map(renderRollRow)
            ) : (
              <li className="text-sm text-gray-500">No recently added fabric rolls.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
