"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import { PayrollStatus } from "@/models/team";

const STATUS_OPTIONS: PayrollStatus[] = ["Pending", "Paid", "Processing"];

type EmployeeOption = { id: string; full_name: string };

export default function NewPayrollPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [overtime, setOvertime] = useState("");
  const [bonus, setBonus] = useState("");
  const [deduction, setDeduction] = useState("");
  const [status, setStatus] = useState<PayrollStatus>("Pending");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEmployees() {
      try {
        const res = await authenticatedFetch("/api/team/employees?perPage=100");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load employees");
        if (mounted) setEmployees(data.employees ?? []);
      } catch (err: any) {
        if (mounted) setLoadError(err.message || "Failed to load employees");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  function validate() {
    const validation: string[] = [];
    if (!employeeId) validation.push("Employee is required.");
    if (!month) validation.push("Payroll month is required.");
    if (!basicSalary || Number.isNaN(Number(basicSalary)) || Number(basicSalary) < 0) validation.push("Basic salary must be a valid non-negative number.");
    if (overtime && (Number.isNaN(Number(overtime)) || Number(overtime) < 0)) validation.push("Overtime must be a valid non-negative number.");
    if (bonus && (Number.isNaN(Number(bonus)) || Number(bonus) < 0)) validation.push("Bonus must be a valid non-negative number.");
    if (deduction && (Number.isNaN(Number(deduction)) || Number(deduction) < 0)) validation.push("Deduction must be a valid non-negative number.");
    return validation;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        employee_id: employeeId,
        month,
        basic_salary: Number(basicSalary),
        overtime: Number(overtime) || 0,
        bonus: Number(bonus) || 0,
        deduction: Number(deduction) || 0,
        payment_status: status,
      };

      const res = await authenticatedFetch("/api/team/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payroll record");
      router.push("/dashboard/team/payroll");
    } catch (err: any) {
      setErrors([err.message || "Unable to save payroll record"]);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Payroll</h1>
          <p className="text-gray-600">Add a payroll record and track net salary for your team.</p>
        </div>
        <Link href="/dashboard/team/payroll" className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
          Back to Payroll
        </Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">
        {errors.length > 0 && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-semibold">Please fix the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payroll Month</label>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basicSalary}
              onChange={(event) => setBasicSalary(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Overtime</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={overtime}
              onChange={(event) => setOvertime(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bonus</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bonus}
              onChange={(event) => setBonus(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deduction</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deduction}
              onChange={(event) => setDeduction(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PayrollStatus)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadError && <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-700">{loadError}</div>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/team/payroll")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
}
