"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Toast, { ToastMessage } from "@/components/Toast";
import { downloadCsv, escapeCsvValue, exportElementToPdf, printElement } from "@/lib/exportUtils";

type FinishedGood = {
  id: string;
  sku: string;
  name: string;
  warehouse_id: string | null;
  warehouse_name?: string;
  stock: number;
  order_id?: string | null;
  source?: "qc_order" | "warehouse_stock";
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
    .rounded-xl, .rounded-lg {
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


export default function FinishedGoodsPage() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [goods, setGoods] = useState<FinishedGood[]>([]);
  const [qcCount, setQcCount] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [keyword, setKeyword] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "qc_order" | "warehouse_stock">("all");

  useEffect(() => {
    let mounted = true;
    async function loadGoods() {
      try {
        setLoading(true);
        const res = await fetch("/api/inventory/finished-goods");
        const data = (await res.json()) as {
          finished_goods?: FinishedGood[];
          qc_orders_count?: number;
          stock_items_count?: number;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Failed to load finished goods");
        if (!mounted) return;
        setGoods(data.finished_goods || []);
        setQcCount(data.qc_orders_count || 0);
        setStockCount(data.stock_items_count || 0);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Unable to load finished goods.";
        setToast({ type: "error", text: message });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadGoods();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleGoods = useMemo(() => {
    let filtered = goods;
    if (sourceFilter === "qc_order") {
      filtered = filtered.filter((g) => g.source === "qc_order");
    } else if (sourceFilter === "warehouse_stock") {
      filtered = filtered.filter((g) => g.source === "warehouse_stock");
    }
    const term = keyword.trim().toLowerCase();
    if (!term) return filtered;
    return filtered.filter((good) =>
      good.name.toLowerCase().includes(term) ||
      good.sku.toLowerCase().includes(term) ||
      (good.warehouse_name || "").toLowerCase().includes(term)
    );
  }, [goods, keyword, sourceFilter]);

  const exportCsv = () => {
    const headers = ["Source", "SKU", "Name", "Warehouse", "Stock"];
    const rows: { [key: string]: string | number }[] = visibleGoods.map((good) => ({
      Source: good.source === "qc_order" ? "QC Order" : "Warehouse Stock",
      SKU: good.sku,
      Name: good.name,
      Warehouse: good.warehouse_name || "—",
      Stock: good.stock,
    }));
    const csvLines = [headers.join(","), ...rows.map((row) => headers.map((h) => escapeCsvValue(row[h])).join(","))];
    downloadCsv(`finished_goods_${Date.now()}.csv`, csvLines.join("\n"));
  };

  const exportPdf = async () => {
    if (!printRef.current) return;
    try {
      setToast({ type: "success", text: "Generating PDF... Please wait." });
      await exportElementToPdf(printRef.current, `finished_goods_${Date.now()}.pdf`);
      setToast({ type: "success", text: "Finished goods PDF downloaded successfully." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setToast({ type: "error", text: message || "Could not export PDF. Please try again." });
    }
  };


  const printPage = () => {
    if (!printRef.current) return;
    printElement(printRef.current);
  };

  return (
    <div ref={printRef} className="print-page p-8 space-y-8">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finished Goods Inventory</h1>
            <p className="text-gray-700">Track final goods available for shipping or dispatch.</p>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            <button onClick={exportCsv} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
              Export CSV
            </button>
            <button onClick={exportPdf} className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition">
              Export PDF
            </button>
            <button onClick={printPage} className="rounded-lg bg-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
              Print
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }} className="no-print bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Finished Goods Search</h2>
            <p className="text-sm text-gray-500">Search by SKU, item name, or warehouse.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as "all" | "qc_order" | "warehouse_stock")}
              className="rounded-lg border border-black text-black px-3 py-2"
            >
              <option value="all">All Sources</option>
              <option value="qc_order">QC Orders ({qcCount})</option>
              <option value="warehouse_stock">Warehouse Stock ({stockCount})</option>
            </select>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search..."
              className="rounded-lg border border-black text-black px-4 py-2 w-full md:w-56"
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-gray-500">Loading finished goods…</div>
        ) : visibleGoods.length === 0 ? (
          <div className="p-8 text-gray-500">No finished goods found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-4 font-semibold text-gray-900">Source</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">SKU / Style</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Location</th>
                  <th className="px-4 py-4 font-semibold text-gray-900">Qty</th>
                  <th className="px-4 py-4 font-semibold text-gray-900 no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleGoods.map((good) => (
                  <tr key={good.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${good.source === "qc_order" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
                        {good.source === "qc_order" ? "QC Passed" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">{good.sku}</td>
                    <td className="px-4 py-4 text-gray-700">{good.name}</td>
                    <td className="px-4 py-4 text-gray-700">{good.warehouse_name || "—"}</td>
                    <td className="px-4 py-4 text-gray-700 font-semibold">{good.stock}</td>
                    <td className="px-4 py-4 no-print">
                      {good.order_id ? (
                        <Link href={`/dashboard/orders/${good.order_id}`} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          View Order →
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
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
