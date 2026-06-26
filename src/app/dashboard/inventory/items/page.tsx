"use client";

import React from "react";
import ItemsTable from "./components/ItemsTable";

export default function ItemsPage() {
  return (
    <div className="border-zinc-950 p-8">
      <div className="border-zinc-950 mb-6">
        <h1 className="  text-black text-2xl font-bold">Inventory Items</h1>
        <p className="text-gray-600">Manage items, stock levels and perform bulk operations.</p>
      </div>

      <ItemsTable />
    </div>
  );
}
