"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";

export default function NewDepartmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const validation: string[] = [];
    if (!name.trim()) validation.push("Department name is required.");
    return validation;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (validation.length > 0) return;

    setSubmitting(true);
    try {
      const res = await authenticatedFetch("/api/team/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create department");
      router.push("/dashboard/team/departments");
    } catch (err: any) {
      setErrors([err.message || "Unable to save department"]);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Department</h1>
          <p className="text-gray-600">Create a department to organize your team resources.</p>
        </div>
        <Link href="/dashboard/team/departments" className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
          Back to Departments
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
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="text-black mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/team/departments")}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Department"}
          </button>
        </div>
      </form>
    </div>
  );
}
