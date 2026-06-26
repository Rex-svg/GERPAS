"use client";

import React from "react";
import WarehousesTable from "./components/WarehousesTable";

export default function WarehousesPage() {
  return (
    <div className="p-8">
      <div className="mb-6"><h1 className=" text-black text-2xl font-bold">Warehouses</h1><p className="text-gray-600">Manage warehouse locations and addresses.</p></div>
      <WarehousesTable />
    </div>
  );
}
