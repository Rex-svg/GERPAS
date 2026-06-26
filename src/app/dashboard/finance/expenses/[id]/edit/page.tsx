"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/apiClient";

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Cheque", "Mobile Wallet"];

export default function EditFinanceExpensePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadExpense() {
      try {
        const res = await authenticatedFetch(`/api/finance/expenses?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load expense");
        const expense = data.expenses?.[0];
        if (!expense) throw new Error("Expense not found");

        if (!mounted) return;
        setCategory(expense.category ?? "");
        setAmount(String(expense.amount ?? ""));
        setPaymentMethod(expense.payment_method ?? "");
        setExpenseDate(expense.expense_date ?? "");
        setDescription(expense.description ?? "");
      } catch (err: any) {
        if (!mounted) return;
        setFetchError(err.message || "Unable to load expense");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadExpense();
    return () => {
      mounted = false;
    };
  }, [id]);

  function validate() {
    const validation: string[] = [];
    if (!category.trim()) validation.push("Category is required.");
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) < 0) validation.push("Amount must be a valid non-negative number.");
    if (!paymentMethod) validation.push("Payment method is required.");
    if (!expenseDate) validation.push("Expense date is required.");
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
      const res = await authenticatedFetch("/api/finance/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          category: category.trim(),
          amount: Number(amount),
          payment_method: paymentMethod,
          expense_date: expenseDate,
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update expense");
      router.push(`/dashboard/finance/expenses/${id}`);
    } catch (err: any) {
      setErrors([err.message || "Unable to update expense"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600">Update expense details for this record.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/finance/expenses/${id}`)}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Expense
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-gray-900">Loading expense…</div>
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
              <label className="block text-sm font-medium text-black">Category</label>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className=" mt-2 w-full rounded-2xl border text-black border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className=" mt-2 w-full rounded-2xl border text-black border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className=" mt-2 w-full rounded-2xl border text-black border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
                className=" mt-2 w-full rounded-2xl border text-black border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className=" mt-2 w-full rounded-3xl border text-black border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/finance/expenses/${id}`)}
              className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Update Expense"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
