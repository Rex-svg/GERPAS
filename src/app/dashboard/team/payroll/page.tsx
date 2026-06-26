"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import PayrollTable from "./components/PayrollTable";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPayrolls() {
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
          const res = await authenticatedFetch(`/api/team/payroll?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch payroll records");
        if (mounted) setPayrolls(data.payrolls ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load payroll history");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayrolls();
    return () => {
      mounted = false;
    };
  }, [search]);

  const totals = useMemo(() => {
    return payrolls.reduce(
      (acc, item) => {
        acc.total += Number(item.net_salary || 0);
        if (item.payment_status === "Paid") acc.paid += 1;
        if (item.payment_status === "Pending") acc.pending += 1;
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [payrolls]);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-600">Generate payroll, mark payments, and track labor costs.</p>
          </div>
          <a href="/dashboard/team/payroll/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Create Payroll</a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Net Payroll</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">Tk{totals.total.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid Records</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.paid}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.pending}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee, month, or status"
            className="text-black rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 w-full lg:max-w-xl"
          />
        </div>
      </section>

      <PayrollTable payrolls={payrolls} loading={loading} error={error} />
    </div>
  );
}
