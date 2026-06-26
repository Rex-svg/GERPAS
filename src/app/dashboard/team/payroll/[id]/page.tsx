"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function loadRecord() {
      try {
        const res = await fetch(`/api/team/payroll?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payroll record");
        if (mounted) setRecord(data.payrolls?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load payroll record");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRecord();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Record</h1>
          <p className="text-gray-600">Review detailed payroll information for this employee.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/team/payroll")}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Payroll
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading payroll record…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !record ? (
          <div className="text-gray-500">Payroll record not found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Employee</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.employee?.full_name ?? "Unknown"}</p>
              <p className="mt-2 text-sm text-gray-500">{record.employee?.employee_code ?? ""}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Month</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.month}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Basic Salary</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">${record.basic_salary.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Net Salary</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">${record.net_salary.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.payment_status}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6 md:col-span-2">
              <p className="text-sm text-gray-500">Details</p>
              <p className="mt-2 text-gray-900">Overtime: ${record.overtime.toFixed(2)}, Bonus: ${record.bonus.toFixed(2)}, Deduction: ${record.deduction.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
