"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Expense } from "@/models/finance";
import ExpensesTable from "./components/ExpensesTable";
import { authenticatedFetch } from "@/lib/apiClient";

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Cheque", "Mobile Wallet"];

export default function FinanceExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadExpenses() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (category) query.set("category", category);
        if (rangeFrom) query.set("from", rangeFrom);
        if (rangeTo) query.set("to", rangeTo);

        const res = await authenticatedFetch(`/api/finance/expenses?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load expenses");
        if (mounted) setExpenses(data.expenses ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load expenses");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadExpenses();
    return () => {
      mounted = false;
    };
  }, [category, rangeFrom, rangeTo]);

  const totals = useMemo(
    () => ({
      count: expenses.length,
      amount: expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    }),
    [expenses]
  );

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track factory expenses, payment methods, and spending categories.</p>
          </div>
          <Link href="/dashboard/finance/expenses/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
            Record Expense
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">Expense Entries</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.count}</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">Total Spend</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">Tk{totals.amount.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Search category"
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3  text-black text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment method</label>
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">All methods</option>
              {PAYMENT_METHODS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From date</label>
            <input
              type="date"
              value={rangeFrom}
              onChange={(event) => setRangeFrom(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-black text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To date</label>
            <input
              type="date"
              value={rangeTo}
              onChange={(event) => setRangeTo(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-black text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      <ExpensesTable expenses={expenses} loading={loading} error={error} selectedMethod={method} />
    </div>
  );
}
