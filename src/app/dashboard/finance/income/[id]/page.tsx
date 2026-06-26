"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Income } from "@/models/finance";
import { authenticatedFetch } from "@/lib/apiClient";

export default function IncomeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function loadIncome() {
      try {
        const res = await authenticatedFetch(`/api/finance/income?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load income record");
        if (mounted) setIncome(data.income?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load income record");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadIncome();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Details</h1>
          <p className="text-gray-600">View details for this income record.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/finance/income/${id}/edit`)}
            className="rounded-3xl border border-sky-600 bg-white px-5 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-50 transition"
          >
            Edit Income
          </button>
          <button
            onClick={() => router.push("/dashboard/finance/income")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Back to Income
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading income details…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !income ? (
          <div className="text-gray-500">Income record not found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Source</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{income.source}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">Tk {income.amount.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Date</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{new Date(income.income_date).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6 md:col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="mt-2 text-gray-900">{income.notes ?? "No notes provided."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
