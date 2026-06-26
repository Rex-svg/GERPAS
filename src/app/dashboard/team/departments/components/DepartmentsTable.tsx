"use client";

import { useRouter } from "next/navigation";

type DepartmentsTableProps = {
  departments: Array<{ id: string; name: string; description: string | null; created_at: string; employee_count: number }>;
  loading: boolean;
  error: string | null;
};

export default function DepartmentsTable({ departments, loading, error }: DepartmentsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-500">Loading departments…</div>
      ) : departments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No departments found. Create a department to organize employees.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Department</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Employees</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4 font-medium text-gray-900">{department.name}</td>
                  <td className="px-4 py-4 text-gray-700">{department.employee_count}</td>
                  <td className="px-4 py-4 text-gray-600">{new Date(department.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => router.push(`/dashboard/team/departments/${department.id}`)}
                      className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
