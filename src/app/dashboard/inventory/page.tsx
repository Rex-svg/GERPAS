"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabase";
import OverviewCard from "./components/OverviewCard";
import ChartsGrid from "./components/ChartsGrid";
import RecentActivity from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";

type Overview = {
  total_items: number;
  total_categories: number;
  total_warehouses: number;
  total_suppliers: number;
  low_stock_count: number;
  total_stock_value: number;
  pending_purchase_orders: number;
  fabric_rolls: number;
};

export default function InventoryPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/inventory/overview");
      if (!res.ok) throw new Error("Failed to load overview");
      const data = await res.json();
      setOverview(data as Overview);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchOverview();
    return () => { mounted = false; };
  }, []);

  // realtime: refresh overview when key tables change
  useEffect(() => {
    const channel = supabase.channel("public:overview");

    const tables = [
      "inventory_items",
      "inventory_transactions",
      "inventory_categories",
      "warehouses",
      "suppliers",
      "orders",
      "fabric_rolls",
    ];

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          fetchOverview();
        }
      );
    });

    channel.subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeholders = (
    <div className=" text-black grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className=" text-black animate-pulse bg-white rounded-xl h-28" />
      ))}
    </div>
  );

  return (
    <div className=" text-black p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory</h1>
        <p className="text-gray-700">Real-time inventory overview and operations</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
      >
        {loading || !overview ? (
          placeholders
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard label="Total Items" value={overview.total_items} icon="📦" />
            <OverviewCard label="Categories" value={overview.total_categories} icon="📁" />
            <OverviewCard label="Warehouses" value={overview.total_warehouses} icon="🏬" />
            <OverviewCard label="Low Stock" value={overview.low_stock_count} icon="⚠️" highlight />
            <OverviewCard label="Stock Value" value={`${overview.total_stock_value.toLocaleString()}`} icon="💰" />
            <OverviewCard label="Pending POs" value={overview.pending_purchase_orders} icon="🧾" />
            <OverviewCard label="Fabric Rolls" value={overview.fabric_rolls} icon="🧵" />
          </div>
        )}
      </motion.div>

      <div className="  text-black grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className=" text-black lg:col-span-2 space-y-6">
          <ChartsGrid />

          <RecentActivity />
        </div>

        <div className=" text-black space-y-6">
          <QuickActions />

          <div className= " text-black bg-white rounded-xl shadow-md p-6">
            <h3 className=" text-black text-lg font-semibold mb-2">Company Mission</h3>
           
            <div className=" text-gray-700 mt-4 text-2xl font-bold">Become the countries largest fabric consumer and textile manufacturer.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
