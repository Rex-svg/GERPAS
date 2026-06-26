"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { exportElementToPdf, printElement } from "@/lib/exportUtils";
import { authenticatedFetch } from "@/lib/apiClient";

interface FinanceReport {
  summary: {
    revenue: number;
    expenses: number;
    payroll: number;
    grossProfit: number;
    netProfit: number;
  } | null;
  expenses: any[];
  income: any[];
  payments: any[];
}

export default function FinanceReportPage() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [report, setReport] = useState<FinanceReport>({
    summary: null,
    expenses: [],
    income: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      try {
        setLoading(true);
        const [summaryRes, expensesRes, incomeRes, paymentsRes] = await Promise.all([
          authenticatedFetch("/api/finance/summary"),
          authenticatedFetch("/api/finance/expenses?perPage=500"),
          authenticatedFetch("/api/finance/income?perPage=500"),
          authenticatedFetch("/api/finance/payments?perPage=500"),
        ]);

        const [summaryData, expensesData, incomeData, paymentsData] = await Promise.all([
          summaryRes.json(),
          expensesRes.json(),
          incomeRes.json(),
          paymentsRes.json(),
        ]);

        if (!mounted) return;

        if (!summaryRes.ok) throw new Error(summaryData?.error || "Failed to load summary");
        if (!expensesRes.ok) throw new Error(expensesData?.error || "Failed to load expenses");
        if (!incomeRes.ok) throw new Error(incomeData?.error || "Failed to load income");
        if (!paymentsRes.ok) throw new Error(paymentsData?.error || "Failed to load payments");

        setReport({
          summary: summaryData.summary,
          expenses: expensesData.expenses ?? [],
          income: incomeData.income ?? [],
          payments: paymentsData.payments ?? [],
        });
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load finance report");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReport();
    return () => { mounted = false; };
  }, []);

  const exportPdf = async () => {
    if (!printRef.current) return;
    try {
      await exportElementToPdf(printRef.current, `finance_report_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const printPage = () => {
    if (!printRef.current) return;
    printElement(printRef.current);
  };

  const totalExpenseAmount = report.expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
  const totalIncomeAmount = report.income.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);
  const totalPaymentAmount = report.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  return (
    <div ref={printRef} className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Report</h1>
            <p className="text-gray-600">Complete financial overview including revenue, expenses, income, and payroll.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportPdf} className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition">
              Export PDF
            </button>
            <button onClick={printPage} className="rounded-lg bg-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Print
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading finance report data…</div>
      ) : (
        <>
          {/* Summary Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="mt-4 text-3xl font-bold text-emerald-600">Tk{(report.summary?.revenue ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="mt-4 text-3xl font-bold text-red-600">Tk{(report.summary?.expenses ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Gross Profit</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">Tk{(report.summary?.grossProfit ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">Tk{(report.summary?.netProfit ?? 0).toFixed(2)}</p>
            </div>
          </motion.div>

          {/* Payroll Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payroll Summary</h2>
            <p className="text-sm text-gray-500 mb-5">Total payroll disbursements recorded.</p>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Total Payroll</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">Tk{(report.summary?.payroll ?? 0).toFixed(2)}</p>
              <p className="mt-2 text-sm text-gray-500">{report.payments.length} payment record(s)</p>
            </div>
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Income Breakdown */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Income Breakdown</h2>
                  <p className="text-sm text-gray-500">{report.income.length} record(s) — Total: Tk{totalIncomeAmount.toFixed(2)}</p>
                </div>
              </div>
              {report.income.length === 0 ? (
                <p className="text-gray-500 text-sm">No income records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-900">Source</th>
                        <th className="px-4 py-3 font-semibold text-gray-900">Amount</th>
                        <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.income.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-4 text-gray-900">{item.source || item.category}</td>
                          <td className="px-4 py-4 text-emerald-600 font-medium">Tk{Number(item.amount).toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-700">{new Date(item.income_date || item.transaction_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>

            {/* Expense Breakdown */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.4 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Expense Breakdown</h2>
                  <p className="text-sm text-gray-500">{report.expenses.length} record(s) — Total: Tk{totalExpenseAmount.toFixed(2)}</p>
                </div>
              </div>
              {report.expenses.length === 0 ? (
                <p className="text-gray-500 text-sm">No expenses found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-900">Category</th>
                        <th className="px-4 py-3 font-semibold text-gray-900">Amount</th>
                        <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.expenses.map((exp: any) => (
                        <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-4 text-gray-900">{exp.category}</td>
                          <td className="px-4 py-4 text-red-600 font-medium">Tk{Number(exp.amount).toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-700">{new Date(exp.expense_date || exp.transaction_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          </div>

          {/* Payments Table */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
                <p className="text-sm text-gray-500">{report.payments.length} record(s) — Total: Tk{totalPaymentAmount.toFixed(2)}</p>
              </div>
            </div>
            {report.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">No payment records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-900">Employee</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Amount</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.payments.map((pay: any) => (
                      <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-4 text-gray-900">{pay.employee?.full_name ?? "N/A"}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">Tk{Number(pay.amount).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            pay.payment_status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : pay.payment_status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {pay.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{new Date(pay.payment_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>

          {/* Report Footer */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            Generated on {new Date().toLocaleString()} — GERPAS Finance Report
          </div>
        </>
      )}
    </div>
  );
}
