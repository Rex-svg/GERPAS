"use client";

import React from "react";
import ItemsTable from "../components/ItemsTable";

export default function NewItemPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className=" text-black text-2xl font-bold">Add Inventory Item</h1>
        <p className="text-gray-600">Create a new inventory item and add it to your warehouse stock.</p>
      </div>
      <ItemsTable autoOpenNew />
    </div>
  );
}
