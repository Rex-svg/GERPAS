"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Toast, { ToastMessage } from "@/components/Toast";
import { downloadCsv, escapeCsvValue, exportElementToPdf, printElement } from "@/lib/exportUtils";
import supabase from "@/lib/supabase";

type MaterialLine = {
  id: string;
  item_id: string;
  item_name: string;
  warehouse_id: string;
  warehouse_name?: string;
  qty: number;
  type: string;
  notes?: string | null;
  created_at: string;
};

type Summary = {
  total_received: number;
  total_used: number;
  unique_items: number;
  unique_warehouses: number;
};

const printStyles = `
  @media print {
    * {
      margin: 0;
      padding: 0;
    }
    body {
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
    }
    .no-print {
      display: none !important;
    }
    .print-page {
      page-break-inside: avoid;
      max-width: 100%;
    }
    h1 {
      border-bottom: 3px solid #059669 !important;
      padding-bottom: 12px !important;
      margin-bottom: 16px !important;
      font-size: 24px;
    }
    h2 {
      margin-top: 20px !important;
      margin-bottom: 12px !important;
    }
    p {
      margin: 0 !important;
      color: #666 !important;
    }
    table {
      border-collapse: collapse !important;
      width: 100%;
      margin-top: 12px;
    }
    table thead {
      display: table-header-group;
    }
    table tbody {
      display: table-row-group;
    }
    table th {
      background: #f3f4f6 !important;
      border: 1px solid #d1d5db !important;
      padding: 10px !important;
      font-weight: 600;
      text-align: left;
    }
    table td {
      border: 1px solid #e5e7eb !important;
      padding: 10px !important;
    }
    .bg-white {
      background: white !important;
      box-shadow: none !important;
    }
    .rounded-xl, .rounded-lg, .rounded-3xl {
      border-radius: 0 !important;
    }
    .shadow-md {
      box-shadow: none !important;
    }
    .hover\\:bg-gray-50:hover {
      background: white !important;
    }
  }
`;

export default function ProductionMaterialUsagePage() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<MaterialLine[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_received: 0,
    total_used: 0,
    unique_items: 0,
    unique_warehouses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [filter, setFilter] = useState({ item: "", warehouse: "", type: "ALL" });

  useEffect(() => {
    let mounted = true;

    async function loadUsage() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.item) params.set("item", filter.item);
        if (filter.warehouse) params.set("warehouse", filter.warehouse);
        if (filter.type && filter.type !== "ALL") params.set("type", filter.type);
        const query = params.toString();
        let url = "/api/inventory/transactions";
        if (query) url += `?${query}`;

        // Attach Supabase access token if available so server-side auth checks succeed
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            // Friendly message for unauthorized users
            throw new Error(data?.error || "Not authenticated. Please sign in.");
          }
          throw new Error(data?.error || "Failed to load material usage");
        }

        const rows = (data.transactions || []) as MaterialLine[];
        if (!mounted) return;
        setLines(rows);

        const received = rows.filter((r) => r.type === "PURCHASE" || r.type === "RECEIVE");
        const used = rows.filter((r) => r.type !== "PURCHASE" && r.type !== "RECEIVE");

        setSummary({
          total_received: received.reduce((sum, r) => sum + Number(r.qty || 0), 0),
          total_used: used.reduce((sum, r) => sum + Math.abs(Number(r.qty || 0)), 0),
          unique_items: new Set(rows.map((r) => r.item_id)).size,
          unique_warehouses: new Set(rows.map((r) => r.warehouse_id)).size,
        });
      } catch (err: any) {
        if (!mounted) return;
        setToast({ type: "error", text: err.message || "Unable to load material usage" });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadUsage();
    return () => {
      mounted = false;
    };
  }, [filter]);

  const exportCsv = () => {
    const headers = ["Item", "Warehouse", "Type", "Qty", "Notes", "Date"];
    const rows = lines.map((row) => ({
      Item: row.item_name,
      Warehouse: row.warehouse_name ?? row.warehouse_id,
      Type: row.type,
      Qty: row.qty,
      Notes: row.notes || "",
      Date: new Date(row.created_at).toLocaleString(),
    }));

    const csv = [
      headers.join(","),
      ...rows.map((row) => {
        return headers
          .map((h) => {
            const value = (row as Record<string, string | number | null | undefined>)[h];
            return escapeCsvValue(value ?? "");
          })
          .join(",");
      }),
    ].join("\n");

    downloadCsv(`material_usage_${Date.now()}.csv`, csv);
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    try {
      setToast({ type: "success", text: "Generating PDF... Please wait." });
      await exportElementToPdf(printRef.current, `material_usage_${Date.now()}.pdf`);
      setToast({ type: "success", text: "Material usage PDF downloaded successfully." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setToast({ type: "error", text: message || "Could not export PDF. Please try again." });
    }
  };

  const printPage = () => {
    if (!printRef.current) return;
    try {
      printElement(printRef.current);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setToast({ type: "error", text: message || "Could not open print window." });
    }
  };

  return (
    <div ref={printRef} className="print-page p-8 space-y-8">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Material Usage</h1>
            <p className="text-gray-600">Track raw material consumption during production.</p>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            <button
              onClick={exportCsv}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={exportPdf}
              className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
            >
              Export PDF
            </button>
            <button
              onClick={printPage}
              className="rounded-lg bg-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              Print
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <div className="rounded-3xl border border-gray-800 bg-white p-6">
          <p className="text-sm text-gray-900">Total Material Used</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{summary.total_used}</p>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-white p-6">
          <p className="text-sm text-gray-900">Unique Materials</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{summary.unique_items}</p>
        </div>
        <div className="rounded-3xl border border-gray-800 bg-white p-6">
          <p className="text-sm text-gray-900">Warehouses Used</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{summary.unique_warehouses}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="no-print bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <p className="text-sm text-gray-800">Filter usage by item or warehouse.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-stone-700">
            <input
              value={filter.item}
              onChange={(e) => setFilter((prev) => ({ ...prev, item: e.target.value }))}
              placeholder="Item ID"
              className="rounded-lg border border-gray-800 px-4 py-2 text-gray-700"
            />
            <input
              value={filter.warehouse}
              onChange={(e) => setFilter((prev) => ({ ...prev, warehouse: e.target.value }))}
              placeholder="Warehouse ID"
              className="rounded-lg border border-gray-800 px-4 py-2 text-gray-700"
            />
            <select
              value={filter.type}
              onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
              className="rounded-lg border border-gray-800 px-4 py-2 text-gray-700"
            >
              <option value="PRODUCTION_USAGE">Production Usage</option>
              <option value="ALL">All Types</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-gray-500">Loading material transactions…</div>
        ) : lines.length === 0 ? (
          <div className="p-8 text-gray-500">No material transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-4 font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Item</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Warehouse</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Qty</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-gray-700">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{row.item_name}</td>
                    <td className="px-4 py-4 text-gray-700">{row.warehouse_name || row.warehouse_id}</td>
                    <td className="px-4 py-4 text-gray-700">{row.type}</td>
                    <td className="px-4 py-4 text-gray-700">{row.qty}</td>
                    <td className="px-4 py-4 text-gray-700">{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        Generated on {new Date().toLocaleString()} • GERPAS ERP System
      </div>
    </div>
  );
}

