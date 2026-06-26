"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Employee } from "@/models/team";
import { authenticatedFetch } from "@/lib/apiClient";
import EmployeesTable from "./components/EmployeesTable";

const STATUS_OPTIONS = ["All", "Active", "Inactive", "On Leave"] as const;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEmployees() {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (status !== "All") query.set("status", status);
      const res = await authenticatedFetch(`/api/team/employees?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch employees");
      setEmployees(data.employees ?? []);
    } catch (err: any) {
      setError(err.message || "Unable to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, [search, status]);

  const totals = useMemo(() => ({
    all: employees.length,
    active: employees.filter((employee) => employee.status === "Active").length,
    inactive: employees.filter((employee) => employee.status === "Inactive").length,
    onLeave: employees.filter((employee) => employee.status === "On Leave").length,
  }), [employees]);

  return (
    <div className="p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600">Create, manage, and review employee salary and department assignments.</p>
          </div>
          <a href="/dashboard/team/employees/new" className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">Add Employee</a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-gray-400 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.all}</p>
        </div>
        <div className="rounded-3xl border border-gray-400 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.active}</p>
        </div>
        <div className="rounded-3xl border border-gray-400 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.inactive}</p>
        </div>
        <div className="rounded-3xl border border-gray-400 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">On Leave</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.onLeave}</p>
        </div>
      </div>

      <section className="text-black rounded-3xl border border-gray-400 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or code"
              className="text-black rounded-2xl border border-gray-400 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="text-black rounded-2xl border border-gray-400 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">Showing {employees.length} employees</div>
        </div>
      </section>

      <EmployeesTable employees={employees} loading={loading} error={error} />
    </div>
  );
}
