"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Payment } from "@/models/finance";
import { authenticatedFetch } from "@/lib/apiClient";

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function loadPayment() {
      try {
        const res = await authenticatedFetch(`/api/finance/payments?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payment record");
        if (mounted) setPayment(data.payments?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load payment record");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayment();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-600">View details for this payment record.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/finance/payments/${id}/edit`)}
            className="rounded-3xl border border-sky-600 bg-white px-5 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-50 transition"
          >
            Edit Payment
          </button>
          <button
            onClick={() => router.push("/dashboard/finance/payments")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Back to Payments
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading payment details…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !payment ? (
          <div className="text-gray-500">Payment record not found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Purchase Order</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{payment.purchase_order_id ?? "N/A"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{payment.supplier_id ?? "N/A"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">Tk{payment.amount.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{payment.payment_status}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{payment.payment_method}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6 md:col-span-2">
              <p className="text-sm text-gray-500">Date</p>
              <p className="mt-2 text-gray-900">{new Date(payment.payment_date).toLocaleDateString()}</p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
