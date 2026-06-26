"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Income } from "@/models/finance";
import IncomeTable from "./components/IncomeTable";
import { authenticatedFetch } from "@/lib/apiClient";

export default function FinanceIncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadIncome() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (source) query.set("source", source);
        if (from) query.set("from", from);
        if (to) query.set("to", to);

        const res = await authenticatedFetch(`/api/finance/income?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load income records");
        if (mounted) setIncome(data.income ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load income records");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadIncome();
    return () => {
      mounted = false;
    };
  }, [source, from, to]);

  const totals = useMemo(
    () => ({
      count: income.length,
      amount: income.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }),
    [income]
  );

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income</h1>
            <p className="text-gray-600">Manage incoming payments, sales receipts, and revenue sources.</p>
          </div>
          <Link href="/dashboard/finance/income/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            Record Income
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Income Records</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.count}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">Tk{totals.amount.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Search source"
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      <IncomeTable income={income} loading={loading} error={error} />
    </div>
  );
}
