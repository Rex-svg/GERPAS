"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Order, OrderStatus, ORDER_STATUSES } from "@/models/order";

type FormState = {
  buyerName: string;
  poNumber?: string;
  buyerCountry?: string;

  styleCode: string;
  productionLine?: string;
  quantity: string;

  color?: string;
  size?: string;
  fabric?: string;

  unitPrice: string;

  orderDate?: string;
  deliveryDate?: string;
  shipmentDate?: string;

  remarks?: string;
  status: OrderStatus;
};

function isValidDateInput(value?: string) {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatErrorList(errors: string[]) {
  if (errors.length === 0) return "";
  return errors.join("\n");
}

export default function NewOrderPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    buyerName: "",
    poNumber: "",
    buyerCountry: "",

    styleCode: "",
    productionLine: "",

    quantity: "",
    color: "",
    size: "",
    fabric: "",

    unitPrice: "",

    orderDate: "",
    deliveryDate: "",
    shipmentDate: "",

    remarks: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const statusOptions: OrderStatus[] = useMemo(() => ORDER_STATUSES, []);

  function validate(): string[] {
    const e: string[] = [];

    const buyerName = form.buyerName.trim();
    const styleCode = form.styleCode.trim();
    const quantityNum = Number(form.quantity);
    const unitPriceNum = Number(form.unitPrice);

    if (!buyerName) e.push("Buyer name is required.");
    if (!form.poNumber?.trim()) {
      // optional per schema, but UI field exists; allow empty
    }
    if (!form.buyerCountry?.trim()) {
      // optional per schema
    }

    if (!styleCode) e.push("Style code is required.");

    if (!form.quantity.trim()) e.push("Quantity is required.");
    else if (Number.isNaN(quantityNum) || quantityNum <= 0) e.push("Quantity must be a number > 0.");

    if (!form.unitPrice.trim()) e.push("Unit price is required.");
    else if (Number.isNaN(unitPriceNum) || unitPriceNum < 0) e.push("Unit price must be >= 0.");

    if (!isValidDateInput(form.orderDate)) e.push("Order date is invalid.");
    if (!isValidDateInput(form.deliveryDate)) e.push("Delivery date is invalid.");
    if (!isValidDateInput(form.shipmentDate)) e.push("Shipment date is invalid.");

    if (!statusOptions.includes(form.status)) e.push("Status is invalid.");

    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (validationErrors.length) return;

    setSubmitting(true);
    try {
      const payload = {
        buyer_name: form.buyerName.trim(),
        po_number: form.poNumber?.trim() || null,
        buyer_country: form.buyerCountry?.trim() || null,
        style_code: form.styleCode.trim(),
        production_line: form.productionLine?.trim() || null,
        quantity: Number(form.quantity),
        color: form.color?.trim() || null,
        size: form.size?.trim() || null,
        fabric: form.fabric?.trim() || null,
        unit_price: Number(form.unitPrice),
        order_date: form.orderDate || null,
        delivery_date: form.deliveryDate || null,
        shipment_date: form.shipmentDate || null,
        remarks: form.remarks?.trim() || null,
        status: form.status,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create order");
      }

      router.push(`/dashboard/orders/${data.order.id}`);
      router.refresh?.();
    } catch (err: any) {
      const msg = err?.message || "Failed to create order";
      setErrors([msg]);
      setSubmitting(false);
      return;
    }
  }

  const hasErrors = touched && errors.length > 0;

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
          <p className="text-gray-600 mt-1">Add a new purchase order to the system</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/orders")}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition"
        >
          ← Back to Orders
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
          {hasErrors && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold mb-2">Please fix the following:</p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {formatErrorList(errors)}
              </pre>
            </div>
          )}

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(ev) => setForm((f) => ({ ...f, status: ev.target.value as OrderStatus }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Default is Pending</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Order Date</label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(ev) => setForm((f) => ({ ...f, orderDate: ev.target.value }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Buyer Name *</label>
              <input
                value={form.buyerName}
                onChange={(ev) => setForm((f) => ({ ...f, buyerName: ev.target.value }))}
                onBlur={() => setTouched(true)}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">PO Number</label>
              <input
                value={form.poNumber || ""}
                onChange={(ev) => setForm((f) => ({ ...f, poNumber: ev.target.value }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Buyer purchase order number</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Buyer Country</label>
              <input
                value={form.buyerCountry || ""}
                onChange={(ev) => setForm((f) => ({ ...f, buyerCountry: ev.target.value }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Style Code *</label>
              <input
                value={form.styleCode}
                onChange={(ev) => setForm((f) => ({ ...f, styleCode: ev.target.value }))}
                onBlur={() => setTouched(true)}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Production Line</label>
              <input
                value={form.productionLine || ""}
                onChange={(ev) => setForm((f) => ({ ...f, productionLine: ev.target.value }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Assigned factory production line</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Quantity *</label>
              <input
                inputMode="numeric"
                value={form.quantity}
                onChange={(ev) => setForm((f) => ({ ...f, quantity: ev.target.value }))}
                onBlur={() => setTouched(true)}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Unit Price *</label>
              <input
                inputMode="decimal"
                value={form.unitPrice}
                onChange={(ev) => setForm((f) => ({ ...f, unitPrice: ev.target.value }))}
                onBlur={() => setTouched(true)}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Delivery Date</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(ev) => setForm((f) => ({ ...f, deliveryDate: ev.target.value }))}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Shipment Date (optional)
              </label>
              <input
                type="date"
                value={form.shipmentDate}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, shipmentDate: ev.target.value }))
                }
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Color / Size / Fabric / Remarks */}
            <div>
              <label className="text-sm font-medium text-gray-700">Color</label>
              <input
                value={form.color || ""}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, color: ev.target.value }))
                }
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Size</label>
              <input
                value={form.size || ""}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, size: ev.target.value }))
                }
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fabric</label>
              <input
                value={form.fabric || ""}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, fabric: ev.target.value }))
                }
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                value={form.remarks || ""}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, remarks: ev.target.value }))
                }
                rows={3}
                className="mt-2 w-full rounded-lg border  text-black border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Optional notes for production, dispatch, etc."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-xs text-gray-500">
              Fields marked with * are required.
            </p>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Order"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
