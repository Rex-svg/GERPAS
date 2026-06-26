"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/apiClient";

export default function EditFinanceIncomePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadIncome() {
      try {
        const res = await authenticatedFetch(`/api/finance/income?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load income record");
        const income = data.income?.[0];
        if (!income) throw new Error("Income record not found");

        if (!mounted) return;
        setSource(income.source ?? "");
        setAmount(String(income.amount ?? ""));
        setIncomeDate(income.income_date ?? "");
        setDescription(income.description ?? "");
      } catch (err: any) {
        if (!mounted) return;
        setFetchError(err.message || "Unable to load income record");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadIncome();
    return () => {
      mounted = false;
    };
  }, [id]);

  function validate() {
    const validation: string[] = [];
    if (!source.trim()) validation.push("Source is required.");
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) < 0) validation.push("Amount must be a valid non-negative number.");
    if (!incomeDate) validation.push("Income date is required.");
    return validation;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;
    if (!id) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/finance/income", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          source: source.trim(),
          amount: Number(amount),
          income_date: incomeDate,
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update income record");
      router.push(`/dashboard/finance/income/${id}`);
    } catch (err: any) {
      setErrors([err.message || "Unable to update income record"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Income</h1>
          <p className="text-gray-600">Update the income source record.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/finance/income/${id}`)}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Income
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-gray-500">Loading income record…</div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">{fetchError}</div>
      ) : (
        <form onSubmit={onSubmit} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
          {errors.length > 0 && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
              <p className="font-semibold">Please fix the following:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Income Date</label>
              <input
                type="date"
                value={incomeDate}
                onChange={(event) => setIncomeDate(event.target.value)}
                className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="text-black mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/finance/income/${id}`)}
              className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Update Income"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
