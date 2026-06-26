"use client";

import React from "react";
import CategoriesTable from "./components/CategoriesTable";

export default function CategoriesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Categories</h1>
        <p className="text-gray-600">Manage product/material categories.</p>
      </div>

      <CategoriesTable />
    </div>
  );
}
