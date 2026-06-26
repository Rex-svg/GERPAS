"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";
import { EmployeeStatus } from "@/models/team";

const STATUS_OPTIONS: EmployeeStatus[] = ["Active", "Inactive", "On Leave"];

type DepartmentOption = { id: string; name: string };

type FormState = {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: EmployeeStatus;
  departmentId: string;
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState<FormState>({
    employeeCode: "",
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "Active",
    departmentId: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDepartments() {
      try {
        const res = await authenticatedFetch("/api/team/departments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load departments");
        if (mounted) setDepartments(data.departments ?? []);
      } catch (err: any) {
        if (mounted) setLoadError(err.message || "Failed to load departments");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  function validate() {
    const validation: string[] = [];
    if (!form.employeeCode.trim()) validation.push("Employee code is required.");
    if (!form.fullName.trim()) validation.push("Full name is required.");
    if (!form.email.trim()) validation.push("Email is required.");
    if (!form.phone.trim()) validation.push("Phone is required.");
    if (!form.designation.trim()) validation.push("Designation is required.");
    if (!form.salary.trim() || Number.isNaN(Number(form.salary)) || Number(form.salary) < 0) validation.push("Salary must be a valid non-negative number.");
    if (!form.joiningDate.trim()) validation.push("Joining date is required.");
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
        employee_code: form.employeeCode,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        designation: form.designation,
        salary: Number(form.salary),
        joining_date: form.joiningDate,
        status: form.status,
        department_id: form.departmentId || null,
      };

      const res = await authenticatedFetch("/api/team/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create employee");
      router.push("/dashboard/team/employees");
    } catch (err: any) {
      setErrors([err.message || "Unable to save employee"]);
      setSubmitting(false);
    }
  }

  const buttonLabel = submitting ? "Saving..." : "Save Employee";

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Employee</h1>
          <p className="text-gray-600">Create a new employee record and assign them to a department.</p>
        </div>
        <Link href="/dashboard/team/employees" className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
          Back to Employees
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
            <label className="block text-sm font-medium text-gray-700">Employee Code</label>
            <input
              value={form.employeeCode}
              onChange={(event) => setForm((f) => ({ ...f, employeeCode: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              value={form.fullName}
              onChange={(event) => setForm((f) => ({ ...f, fullName: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Designation</label>
            <input
              value={form.designation}
              onChange={(event) => setForm((f) => ({ ...f, designation: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Salary</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.salary}
              onChange={(event) => setForm((f) => ({ ...f, salary: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Joining Date</label>
            <input
              type="date"
              value={form.joiningDate}
              onChange={(event) => setForm((f) => ({ ...f, joiningDate: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={form.departmentId}
              onChange={(event) => setForm((f) => ({ ...f, departmentId: event.target.value }))}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Unassigned</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm((f) => ({ ...f, status: event.target.value as EmployeeStatus }))}
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
            onClick={() => router.push("/dashboard/team/employees")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
