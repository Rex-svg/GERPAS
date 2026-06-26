"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function loadRecord() {
      try {
        const res = await fetch(`/api/team/attendance?id=${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load attendance record");
        if (mounted) setRecord(data.attendance?.[0] ?? null);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load attendance record");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRecord();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Record</h1>
          <p className="text-gray-600">Review attendance details for this record.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/team/attendance")}
          className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          Back to Attendance
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-gray-500">Loading attendance record…</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        ) : !record ? (
          <div className="text-gray-500">Attendance record not found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Employee</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.employee?.full_name ?? "Unknown"}</p>
              <p className="text-sm text-gray-500">{record.employee?.designation ?? ""}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Date</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{new Date(record.attendance_date).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.status}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{record.total_hours ?? "—"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6 md:col-span-2">
              <p className="text-sm text-gray-500">Check In / Check Out</p>
              <p className="mt-2 text-gray-900">{record.check_in || "—"} / {record.check_out || "—"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
