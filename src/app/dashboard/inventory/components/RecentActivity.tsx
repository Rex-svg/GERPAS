"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../../../lib/supabase";

type Tx = {
  id: string;
  created_at: string;
  item_name: string;
  warehouse: string;
  type: string;
  qty: number;
  created_by?: string;
};

export default function RecentActivity() {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/inventory/transactions?limit=8");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (mounted) setItems(data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRecent();
    // subscribe to realtime transactions
    const channel = supabase
      .channel("public:inventory_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_transactions" },
        (payload) => {
          // when a new transaction is inserted, refetch recent
          fetchRecent();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Inventory Activity</h3>
        <a href="/dashboard/inventory/transactions" className="text-emerald-600">
          View all
        </a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No recent activity</div>
      ) : (
        <ul className="space-y-3">
          {items.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{tx.item_name}</p>
                <p className="text-xs text-gray-500">{tx.warehouse} • {new Date(tx.created_at).toLocaleString()}</p>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${tx.qty < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {tx.qty > 0 ? `+${tx.qty}` : tx.qty}
                </p>
                <p className="text-xs text-gray-500">{tx.type}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
