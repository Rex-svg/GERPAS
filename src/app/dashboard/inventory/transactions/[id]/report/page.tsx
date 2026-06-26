"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import html2pdf from "html2pdf.js";

type Settings = {
  factory_name: string;
  email: string;
  phone: string;
  address: string;
};

type TransactionReport = {
  id: string;
  created_at: string;
  item_id: string;
  quantity: number;
  transaction_type: string;
  warehouse_id: string | null;
  notes: string | null;
  created_by: string | null;
  purchase_order_id: string | null;
  reference_order_id: string | null;
  unit_cost: number;
  total_cost: number;
  inventory_items?: { name?: string; sku?: string };
  warehouses?: { name?: string };
};

export default function TransactionReportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const reportRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionReport | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [show, setShow] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/inventory/transactions/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load transaction");
        setTransaction(data.transaction || data);
      } catch (e: any) {
        setToast(e?.message || "Failed to load transaction");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const s = data?.settings || data?.data || data;
        setSettings({
          factory_name: s?.factory_name || "Factory Name",
          email: s?.email || "-",
          phone: s?.phone || "-",
          address: s?.address || "-",
        });
      } catch {
        setSettings({ factory_name: "Factory Name", email: "-", phone: "-", address: "-" });
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const total = transaction?.total_cost ?? 0;
    const unit = transaction?.unit_cost ?? 0;
    return { total, unit };
  }, [transaction]);

  const printReport = () => {
    setTimeout(() => window.print(), 200);
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({
        margin: 10,
        filename: `transaction-${transaction?.id || id}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  if (loading) {
    return (
      <div className="p-8 text-black">
        <div className="text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!transaction || !settings) {
    return (
      <div className="p-8 text-black">
        <div className="text-red-700">Failed to generate report.</div>
        {toast && <div className="mt-2 text-sm">{toast}</div>}
        <button className="mt-4 px-4 py-2 border rounded" onClick={() => router.back()}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 text-black">
      <div className="flex justify-between items-start flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Inventory Transaction Report</h1>
          <p className="text-gray-600">Printable report for transaction #{transaction.id}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded border-gray-950 text-gray-700">
            Back
          </button>
          <button onClick={() => printReport()} className="px-4 py-2 bg-black text-white rounded">
            Print
          </button>
          <button onClick={() => downloadPDF()} className="px-4 py-2 bg-emerald-600 text-white rounded">
            Download PDF
          </button>
        </div>
      </div>

      <div
        id="inventory-transaction-report"
        ref={reportRef}
        style={{ background: "#ffffff", color: "#000000" }}
        className="w-[210mm] min-h-[297mm] shadow-xl p-10 mx-auto"
      >
        {/* FACTORY HEADER */}
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: "bold" }}>{settings.factory_name}</h1>
          <p style={{ fontSize: 12 }}>{settings.address}</p>
          <p style={{ fontSize: 12 }}>
            {settings.email} | {settings.phone}
          </p>
        </div>

        {/* TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold" }}>INVENTORY TRANSACTION</h2>
          <p style={{ fontSize: 12 }}>Transaction ID: {transaction.id}</p>
          <p style={{ fontSize: 12 }}>Date: {new Date(transaction.created_at).toLocaleString()}</p>
        </div>

        {/* DETAILS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 12 }}>
          <div>
            <p>
              <b>Item:</b> {transaction.inventory_items?.name || transaction.item_id}
            </p>
            <p>
              <b>SKU:</b> {transaction.inventory_items?.sku || "-"}
            </p>
            <p>
              <b>Warehouse:</b> {transaction.warehouses?.name || transaction.warehouse_id || "-"}
            </p>
            <p>
              <b>Transaction Type:</b> {transaction.transaction_type}
            </p>
            <p>
              <b>Quantity:</b> {transaction.quantity}
            </p>
          </div>

          <div>
            <p>
              <b>Unit Cost:</b> {totals.unit}
            </p>
            <p>
              <b>Total Cost:</b> {totals.total}
            </p>
            <p>
              <b>PO Reference:</b> {transaction.purchase_order_id || "-"}
            </p>
            <p>
              <b>Reference Order:</b> {transaction.reference_order_id || "-"}
            </p>
            <p>
              <b>Notes:</b> {transaction.notes || "-"}
            </p>
          </div>
        </div>

        {/* SIGNATURE PLACEHOLDER */}
        <div style={{ marginTop: 40 }}>
          <div style={{ borderTop: "1px solid #000", width: "100%", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%", textAlign: "center" }}>
              <p style={{ fontWeight: "bold", marginBottom: 4 }}>Authorized By</p>
              <p>Signature: _______________________</p>
            </div>
            <div style={{ width: "45%", textAlign: "center" }}>
              <p style={{ fontWeight: "bold", marginBottom: 4 }}>Factory Stamp</p>
              <p>(Optional)</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 30, fontSize: 10, textAlign: "center", color: "#555" }}>
          This is a system generated ERP inventory transaction report.
        </div>
      </div>
    </div>
  );
}

