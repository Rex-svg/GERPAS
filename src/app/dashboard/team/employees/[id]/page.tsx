"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Employee } from "@/models/team";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    let mounted = true;
    async function loadEmployee() {
      try {
        const res = await fetch(`/api/team/employees?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load employee");
        if (mounted) setEmployee(data.employees?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load employee");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEmployee();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
          <p className="text-gray-600">Review employee information and payroll assignment.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/team/employees")}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Employees
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading employee details…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !employee ? (
          <div className="text-gray-500">Employee not found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{employee.full_name}</h2>
              <p className="text-sm text-gray-500">{employee.email}</p>
              <p className="mt-4 text-sm text-gray-600">Employee code: {employee.employee_code}</p>
              <p className="mt-2 text-sm text-gray-600">Status: {employee.status}</p>
            </div>
            <div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-gray-500">Department ID</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{employee.department_id ?? "Unassigned"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 mt-4">
                <p className="text-sm text-gray-500">Designation</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{employee.designation}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">Salary</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">Tk{typeof employee.salary === "number" ? employee.salary.toFixed(2) : "0.00"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">Joining Date</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{new Date(employee.joining_date).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
