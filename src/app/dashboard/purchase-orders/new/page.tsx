"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseOrderNewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/orders/new");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-lg">
        <p className="text-lg font-semibold text-gray-900">Redirecting to purchase order creation…</p>
        <p className="mt-3 text-sm text-gray-500">If the redirect does not happen automatically, <a href="/dashboard/orders/new" className="font-medium text-emerald-600">click here</a>.</p>
      </div>
    </div>
  );
}
