"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import DepartmentsTable from "./components/DepartmentsTable";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDepartments() {
      try {
          const res = await authenticatedFetch("/api/team/departments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch departments");
        if (mounted) setDepartments(data.departments ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load departments");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Create and manage teams across your factory operations.</p>
          </div>
          <a href="/dashboard/team/departments/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Add Department</a>
        </div>
      </motion.div>

      <DepartmentsTable departments={departments} loading={loading} error={error} />
    </div>
  );
}
