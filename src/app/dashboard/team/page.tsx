"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MetricCard from "@/components/MetricCard";
import supabase from "@/lib/supabase";

interface Summary {
  totalEmployees: number;
  activeEmployees: number;
  departmentCount: number;
  monthlyPayrollCost: number;
  attendanceRate: number;
}

export default function TeamDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Not authenticated");
        }

        const res = await fetch("/api/team/summary", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load team summary");
        }

        if (mounted) {
          setSummary(data.summary);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Unable to load team summary");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Track employee performance, payroll, attendance, and departments.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total Employees" value={loading ? "..." : summary?.totalEmployees ?? 0} />
        <MetricCard title="Active Employees" value={loading ? "..." : summary?.activeEmployees ?? 0} />
        <MetricCard title="Departments" value={loading ? "..." : summary?.departmentCount ?? 0} />
        <MetricCard title="Monthly Payroll" value={loading ? "..." : `Tk${summary?.monthlyPayrollCost.toFixed(2) ?? "0.00"}`} />
        <MetricCard title="Attendance Rate" value={loading ? "..." : `${summary?.attendanceRate.toFixed(1) ?? "0.0"}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Workforce Insights</h2>
              <p className="text-sm text-gray-500">Real-time team analytics across your factory.</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700">{error}</div>
          ) : loading ? (
            <div className="text-gray-500">Loading analytics…</div>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-medium text-gray-900">Department structure</p>
                <p className="mt-2 text-gray-600">{summary?.departmentCount} active departments aligned with your operational teams.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-medium text-gray-900">Total payroll exposure</p>
                <p className="mt-2 text-gray-600">Tk{summary?.monthlyPayrollCost.toFixed(2)} monthly salary commitment across employees.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-medium text-gray-900">Attendance performance</p>
                <p className="mt-2 text-gray-600">Your attendance rate is {summary?.attendanceRate.toFixed(1)}% over the last 30 days.</p>
              </div>
            </div>
          )}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900">Quick Access</h2>
          <div className="mt-6 grid gap-3">
            <a href="/dashboard/team/employees" className="rounded-3xl border border-gray-200 bg-emerald-600 px-4 py-4 text-white text-sm font-semibold hover:bg-emerald-700 transition">Manage Employees</a>
            <a href="/dashboard/team/departments" className="rounded-3xl border border-gray-200 px-4 py-4 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition">Manage Departments</a>
            <a href="/dashboard/team/attendance" className="rounded-3xl border border-gray-200 px-4 py-4 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition">Attendance Tracker</a>
            <a href="/dashboard/team/payroll" className="rounded-3xl border border-gray-200 px-4 py-4 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition">Payroll & Payouts</a>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
