"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/apiClient";

const PAYMENT_STATUSES = ["Paid", "Pending", "Partial", "Overdue"] as const;

export default function EditFinancePaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<typeof PAYMENT_STATUSES[number]>("Pending");
  const [paymentDate, setPaymentDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadPayment() {
      try {
        const res = await authenticatedFetch(`/api/finance/payments?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payment record");
        const payment = data.payments?.[0];
        if (!payment) throw new Error("Payment record not found");

        if (!mounted) return;
        setPurchaseOrderId(payment.purchase_order_id ?? "");
        setSupplierId(payment.supplier_id ?? "");
        setAmount(String(payment.amount ?? ""));
        setPaymentMethod(payment.payment_method ?? "");
        setPaymentStatus(payment.payment_status ?? "Pending");
        setPaymentDate(payment.payment_date ?? "");
      } catch (err: any) {
        if (!mounted) return;
        setFetchError(err.message || "Unable to load payment record");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadPayment();
    return () => {
      mounted = false;
    };
  }, [id]);

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
    if (!id) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/finance/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          purchase_order_id: purchaseOrderId || null,
          supplier_id: supplierId || null,
          amount: Number(amount),
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          payment_date: paymentDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update payment record");
      router.push(`/dashboard/finance/payments/${id}`);
    } catch (err: any) {
      setErrors([err.message || "Unable to update payment record"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
          <p className="text-gray-600">Update the supplier payment details.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/finance/payments/${id}`)}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Payment
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-gray-500">Loading payment…</div>
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
              onClick={() => router.push(`/dashboard/finance/payments/${id}`)}
              className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Update Payment"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
