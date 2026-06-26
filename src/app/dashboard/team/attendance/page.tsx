"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import AttendanceTable from "./components/AttendanceTable";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAttendance() {
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
          const res = await authenticatedFetch(`/api/team/attendance?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch attendance");
        if (mounted) setAttendance(data.attendance ?? []);
      } catch (err: any) {
        if (mounted) setError(err.message || "Unable to load attendance records");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAttendance();
    return () => {
      mounted = false;
    };
  }, [search]);

  const summary = useMemo<
    Record<"Present" | "Absent" | "Late" | "On Leave", number>
  >(() => {
    return attendance.reduce(
      (acc, record) => {
        const status = record.status as "Present" | "Absent" | "Late" | "On Leave";
        if (status in acc) {
          acc[status] += 1;
        }
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, "On Leave": 0 }
    );
  }, [attendance]);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600">Mark attendance, check in/out, and review historical attendance data.</p>
          </div>
          <a href="/dashboard/team/attendance/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Mark Attendance</a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(summary).map(([status, count]) => (
          <div key={status} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{status}</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name or status"
            className="text-black rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 w-full lg:max-w-sm"
          />
        </div>
      </section>

      <AttendanceTable attendance={attendance} loading={loading} error={error} />
    </div>
  );
}
