"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";

const PAYMENT_STATUSES = ["Paid", "Pending", "Partial", "Overdue"] as const;

export default function NewFinancePaymentPage() {
  const router = useRouter();
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<typeof PAYMENT_STATUSES[number]>("Pending");
  const [paymentDate, setPaymentDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const validation: string[] = [];
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) < 0) validation.push("Amount must be a valid non-negative number.");
    if (!paymentMethod.trim()) validation.push("Payment method is required.");
    if (!paymentDate) validation.push("Payment date is required.");
    return validation;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_order_id: purchaseOrderId || null,
          supplier_id: supplierId || null,
          amount: Number(amount),
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          payment_date: paymentDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment");
      router.push("/dashboard/finance/payments");
    } catch (err: any) {
      setErrors([err.message || "Unable to save payment"]);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600">Add a supplier payment or purchase settlement.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/finance/payments")}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Payments
        </button>
      </div>

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
            <label className="block text-sm font-medium text-gray-700">Purchase Order ID</label>
            <input
              value={purchaseOrderId}
              onChange={(event) => setPurchaseOrderId(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier ID</label>
            <input
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <input
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/finance/payments")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
