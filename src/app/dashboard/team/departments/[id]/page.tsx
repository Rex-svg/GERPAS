"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [department, setDepartment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function loadDepartment() {
      try {
        const res = await fetch(`/api/team/departments?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load department");
        if (mounted) setDepartment(data.departments?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load department");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDepartment();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Details</h1>
          <p className="text-gray-600">View department info and employee counts.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/team/departments")}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Departments
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading department details…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !department ? (
          <div className="text-gray-500">Department not found.</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{department.name}</h2>
              <p className="text-sm text-gray-500">Created on {new Date(department.created_at).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-3 text-gray-900">{department.description || "No description provided."}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Employee Count</p>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{department.employee_count ?? 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
