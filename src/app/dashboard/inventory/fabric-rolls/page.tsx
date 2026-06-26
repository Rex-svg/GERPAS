"use client";

import React from "react";
import FabricRollsTable from "./components/FabricRollsTable";

export default function FabricRollsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Fabric Rolls</h1>
        <p className="text-gray-800">Manage fabric rolls, track meters, and receive new rolls into inventory.</p>
      </div>
      <FabricRollsTable />
    </div>
  );
}
