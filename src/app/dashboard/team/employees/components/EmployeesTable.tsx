"use client";

import { Employee } from "@/models/team";
import { useRouter } from "next/navigation";

type EmployeesTableProps = {
  employees: Employee[];
  loading: boolean;
  error: string | null;
};

export default function EmployeesTable({ employees, loading, error }: EmployeesTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-500">Loading employees…</div>
      ) : employees.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No employees found. Use Add Employee to create your first record.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Employee</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Department</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Designation</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Salary</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{employee.full_name}</div>
                    <div className="text-xs text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{employee.department_id ?? "Unassigned"}</td>
                  <td className="px-4 py-4 text-gray-700">{employee.designation}</td>
                  <td className="px-4 py-4 text-gray-900">Tk{typeof employee.salary === "number" ? employee.salary.toFixed(2) : "0.00"}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">{employee.status}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => router.push(`/dashboard/team/employees/${employee.id}`)}
                      className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      View
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
