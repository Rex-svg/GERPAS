"use client";

import React from "react";

const actions = [
  { title: "Add Item", href: "/dashboard/inventory/items/new", color: "emerald" },
  { title: "Finished Goods", href: "/dashboard/inventory/finished-goods", color: "orange" },
  { title: "View Transactions", href: "/dashboard/inventory/transactions", color: "blue" },
  { title: "Fabric Rolls", href: "/dashboard/inventory/fabric-rolls", color: "emerald" },
  { title: "Stock Adjustment", href: "/dashboard/inventory/stock", color: "orange" },
  { title: "Receive Materials", href: "/dashboard/purchase-orders/receive", color:"pink" },
  { title: "Generate Report", href: "/dashboard/reports", color: "slate" },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className=" text-black text-lg font-semibold mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <a
            key={a.title}
            href={a.href}
            className={`py-2 px-3 rounded-lg text-sm font-semibold text-black bg-${a.color}-600 hover:opacity-95 transition text-center`}
          >
            {a.title}
          </a>
        ))}
      </div>
    </div>
  );
}
