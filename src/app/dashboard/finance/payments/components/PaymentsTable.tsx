"use client";

import { useRouter } from "next/navigation";
import { Payment } from "@/models/finance";

type PaymentsTableProps = {
  payments: Payment[];
  loading: boolean;
  error: string | null;
};

export default function PaymentsTable({ payments, loading, error }: PaymentsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-500">Loading payments…</div>
      ) : payments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No payments recorded yet. Add a payment to manage supplier settlements.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Method</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4 text-gray-900">Tk{payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-gray-900">{payment.payment_status}</td>
                  <td className="px-4 py-4 text-gray-700">{payment.payment_method}</td>
                  <td className="px-4 py-4 text-gray-700">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/finance/payments/${payment.id}`)}
                      className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/finance/payments/${payment.id}/edit`)}
                      className="rounded-full border border-sky-600 px-4 py-2 text-sky-600 hover:bg-sky-50 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
