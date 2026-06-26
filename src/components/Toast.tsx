"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export type ToastMessage = {
  type: "success" | "error" | "info";
  text: string;
};

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgClass =
    toast.type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : toast.type === "error"
      ? "bg-red-50 border-red-200 text-red-900"
      : "bg-slate-50 border-slate-200 text-slate-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 shadow-xl ${bgClass}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl">{toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}</div>
        <div className="text-sm font-medium leading-snug">{toast.text}</div>
      </div>
    </motion.div>
  );
}
