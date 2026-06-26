"use client";

import React from "react";
import TransactionsTable from "./components/TransactionsTable";

export default function TransactionsPage() {
  return (
    <div className="p-8">
      <div className="mb-6"><h1 className=" text-black text-2xl font-bold">Inventory Transactions</h1><p className="text-gray-600">View and filter all inventory transactions.</p></div>
      <TransactionsTable />
    </div>
  );
}
