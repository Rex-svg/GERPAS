"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import MetricCard from "@/components/MetricCard";
import supabase from "@/lib/supabase";

export default function FinanceDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [recentIncome, setRecentIncome] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Not authenticated");
        }

        const headers = { "Authorization": `Bearer ${session.access_token}` };

        const [summaryRes, expensesRes, incomeRes] = await Promise.all([
          fetch("/api/finance/summary", { headers }),
          fetch("/api/finance/expenses?perPage=5", { headers }),
          fetch("/api/finance/income?perPage=5", { headers }),
        ]);

        const [summaryData, expensesData, incomeData] = await Promise.all([
          summaryRes.json(),
          expensesRes.json(),
          incomeRes.json(),
        ]);

        if (!mounted) return;

        if (!summaryRes.ok) throw new Error(summaryData.error || "Failed to load summary");
        if (!expensesRes.ok) throw new Error(expensesData.error || "Failed to load expenses");
        if (!incomeRes.ok) throw new Error(incomeData.error || "Failed to load income");

        setSummary(summaryData.summary);
        setRecentExpenses(expensesData.expenses ?? []);
        setRecentIncome(incomeData.income ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load finance data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const earnings = useMemo(() => ({
    revenue: summary?.revenue ?? 0,
    expenses: summary?.expenses ?? 0,
    grossProfit: summary?.grossProfit ?? 0,
    netProfit: summary?.netProfit ?? 0,
  }), [summary]);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance & Accounting</h1>
            <p className="text-gray-600">Track revenue, expenses, profit, and payments for your factory.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Revenue" value={loading ? "..." : `Tk${earnings.revenue.toFixed(2)}`} />
        <MetricCard title="Total Expenses" value={loading ? "..." : `Tk${earnings.expenses.toFixed(2)}`} />
        <MetricCard title="Gross Profit" value={loading ? "..." : `Tk${earnings.grossProfit.toFixed(2)}`} />
        <MetricCard title="Net Profit" value={loading ? "..." : `Tk${earnings.netProfit.toFixed(2)}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-500">Latest expenses and income activity.</p>
            </div>
          </div>
          {loading ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-gray-500">Loading transactions…</div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
          ) : (
            <div className="space-y-4">
              {/* Recent Expenses */}
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">Recent Expenses</h3>
                {recentExpenses.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No expenses yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentExpenses.map((exp: any) => (
                      <div key={exp.id} className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{exp.category}</p>
                          <p className="text-xs text-gray-500">{new Date(exp.expense_date || exp.transaction_date).toLocaleDateString()}</p>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-red-600 whitespace-nowrap">-Tk{Number(exp.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Income */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 mb-2">Recent Income</h3>
                {recentIncome.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No income yet.</p>
                ) : (
                  <div className="space-y-2">
                    {recentIncome.map((inc: any) => (
                      <div key={inc.id} className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{inc.source || inc.category}</p>
                          <p className="text-xs text-gray-500">{new Date(inc.income_date || inc.transaction_date).toLocaleDateString()}</p>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-emerald-600 whitespace-nowrap">+Tk{Number(inc.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.section>

        <motion.aside className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Links</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/dashboard/finance/expenses" className="rounded-3xl border border-gray-200 px-4 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition bg-red-400">Expenses</Link>
              <Link href="/dashboard/finance/income" className="rounded-3xl border border-gray-200 px-4 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition bg-emerald-400">Income</Link>
              <Link href="/dashboard/finance/payments" className="rounded-3xl border border-gray-200 px-4 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition bg-amber-300">Payments</Link>
              <Link href="/dashboard/finance/report" className="rounded-3xl border border-gray-200 px-4 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition bg-blue-400">Reports</Link>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
