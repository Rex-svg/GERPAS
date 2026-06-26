"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Payment } from "@/models/finance";
import PaymentsTable from "./components/PaymentsTable";
import { authenticatedFetch } from "@/lib/apiClient";

const STATUS_OPTIONS = ["All", "Paid", "Pending", "Partial", "Overdue"] as const;

export default function FinancePaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (status !== "All") query.set("status", status);
        if (from) query.set("from", from);
        if (to) query.set("to", to);

        const res = await authenticatedFetch(`/api/finance/payments?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payments");
        if (mounted) setPayments(data.payments ?? []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setError(message || "Unable to load payments");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayments();
    return () => {
      mounted = false;
    };
  }, [status, from, to]);

  const totals = useMemo(
    () => ({
      count: payments.length,
      amount: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    }),
    [payments]
  );

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Manage supplier payments, payment status, and cash flow outflows.</p>
          </div>
          <Link href="/dashboard/finance/payments/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            Record Payment
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Payment Records</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.count}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">Tk{totals.amount.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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

      <PaymentsTable payments={payments} loading={loading} error={error} />
    </div>
  );
}
