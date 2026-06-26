"use client";

import React from "react";
import StockTable from "./components/StockTable";

export default function StockPage() {
  return (
    <div className="text-black p-8">
      <div className="text-black mb-6">
        <h1 className=" text-black text-2xl font-bold">Stock Management</h1>
        <p className="text-gray-800">View stock by warehouse, transfer stock and apply manual adjustments.</p>
      </div>

      <StockTable />
    </div>
  );
}
