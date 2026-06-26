"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import { Order, OrderStatus, ORDER_STATUSES } from "@/models/order";

type Settings = {
  factory_name: string;
  email: string;
  phone: string;
  address: string;
};

function statusPillClass(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cutting":
      return "bg-blue-100 text-blue-800";
    case "Sewing":
      return "bg-purple-100 text-purple-800";
    case "Finishing":
      return "bg-indigo-100 text-indigo-800";
    case "QC":
      return "bg-orange-100 text-orange-800";
    case "Shipped":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-emerald-100 text-emerald-800";
  }
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const reportRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const [showReport, setShowReport] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ---------------- FETCH ORDER ----------------
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch order");
        setOrder(data.order);
      } catch (e: any) {
        setToast({ type: "error", msg: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---------------- FETCH SETTINGS ----------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/settings`);
        const data = await res.json();

        const s = data?.settings || data?.data || data;

        setSettings({
          factory_name: s?.factory_name || "Factory Name",
          email: s?.email || "-",
          phone: s?.phone || "-",
          address: s?.address || "-",
        });
      } catch {
        setSettings({
          factory_name: "Factory Name",
          email: "-",
          phone: "-",
          address: "-",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const totalValue = useMemo(() => {
    if (!order) return 0;
    return Number(order.quantity) * Number(order.unit_price);
  }, [order]);

  // ---------------- STATUS UPDATE ----------------
  async function patchStatus(nextStatus: OrderStatus) {
    if (!id || !order) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      setOrder(data.order);
      setToast({ type: "success", msg: "Status updated" });
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ---------------- PRINT ----------------
  function printReport() {
    setTimeout(() => window.print(), 200);
  }

  // ---------------- PDF EXPORT ----------------
  function downloadPDF() {
    if (!reportRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `order-${order?.id}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(reportRef.current)
      .save();
  }

  return (
    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-start flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-black text-3xl font-bold">Order Details</h1>
          <p className="text-gray-600">Production & Commercial Module</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded border-gray-950 text-gray-700">
            Back
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`p-3 rounded border ${
          toast.type === "success"
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ================= REPORT ================= */}
      {showReport && order && (
        <div className="flex flex-col items-center">

          {/* ACTIONS */}
          <div className="flex gap-3 mb-4 print:hidden">
            <button onClick={printReport} className="px-4 py-2 bg-gray-800 text-white rounded">
              Print
            </button>

            <button onClick={downloadPDF} className="px-4 py-2 bg-emerald-600 text-white rounded">
              Download PDF
            </button>

            <button onClick={() => setShowReport(false)} className="px-4 py-2 border rounded border-red-700 text-red-700">
              Close
            </button>
          </div>

          {/* A4 REPORT */}
          <div
            id="erp-report"
            ref={reportRef}
            style={{
              background: "#ffffff",
              color: "#000000",
            }}
            className="w-[210mm] min-h-[297mm] shadow-xl p-10"
          >

            {/* FACTORY HEADER */}
            <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "12px", marginBottom: "20px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>
                {settings?.factory_name}
              </h1>
              <p style={{ fontSize: "12px" }}>{settings?.address}</p>
              <p style={{ fontSize: "12px" }}>
                {settings?.email} | {settings?.phone}
              </p>
            </div>

            {/* TITLE */}
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
                ORDER INVOICE REPORT
              </h2>
              <p style={{ fontSize: "12px" }}>Order ID: {order.id}</p>
            </div>

            {/* DETAILS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "12px" }}>
              <div>
                <p><b>Buyer:</b> {order.buyer_name}</p>
                <p><b>PO:</b> {order.po_number || "-"}</p>
                <p><b>Country:</b> {order.buyer_country || "-"}</p>
                <p><b>Style:</b> {order.style_code}</p>
              </div>

              <div>
                <p><b>Quantity:</b> {order.quantity}</p>
                <p><b>Unit Price:</b> {order.unit_price}</p>
                <p><b>Total:</b> {totalValue.toFixed(2)}</p>
                <p><b>Status:</b> {order.status}</p>
              </div>
            </div>

            {/* REMARKS */}
            <div style={{ marginTop: "20px", fontSize: "12px" }}>
              <b>Remarks:</b>
              <p>{order.remarks || "-"}</p>
            </div>

            {/* SIGNATURE */}
            <div style={{
              marginTop: "60px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px"
            }}>
              <div style={{ borderTop: "1px solid #000", width: "180px", textAlign: "center", paddingTop: "6px" }}>
                Buyer Signature
              </div>

              <div style={{ borderTop: "1px solid #000", width: "180px", textAlign: "center", paddingTop: "6px" }}>
                Authorized Signature
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ marginTop: "40px", fontSize: "10px", textAlign: "center", color: "#555" }}>
              This is a system generated ERP invoice.
            </div>

          </div>
        </div>
      )}

      {/* ================= NORMAL VIEW ================= */}
      {!showReport && order && (
        <motion.div className="bg-white p-6 rounded-xl shadow text-black">
          <h2 className="text-xl font-bold">Live Order View</h2>

          <div className="mt-4">
            <p><b>Buyer:</b> {order.buyer_name}</p>
            <p><b>Quantity:</b> {order.quantity}</p>
            <p><b>Status:</b> {order.status}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}