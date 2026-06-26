"use client";

import { useRouter } from "next/navigation";

type AttendanceTableProps = {
  attendance: Array<{ id: string; attendance_date: string; status: string; total_hours?: number; employee?: { full_name: string; designation: string } }>;
  loading: boolean;
  error: string | null;
};

export default function AttendanceTable({ attendance, loading, error }: AttendanceTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-500">Loading attendance history…</div>
      ) : attendance.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No attendance records found. Add your first record.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Employee</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Hours</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{record.employee?.full_name ?? "Unknown"}</div>
                    <div className="text-xs text-gray-500">{record.employee?.designation ?? "-"}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{new Date(record.attendance_date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-gray-900">{record.status}</td>
                  <td className="px-4 py-4 text-gray-700">{record.total_hours ?? "—"}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => router.push(`/dashboard/team/attendance/${record.id}`)}
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
