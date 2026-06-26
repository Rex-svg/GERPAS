"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/apiClient";

export default function SettingsPage() {
  const [factory, setFactory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFactory();
  }, []);

  async function loadFactory() {
    try {
      const res = await authenticatedFetch("/api/factory");

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      setFactory(data.factory);
    } catch (err) {
      console.error("Factory load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const res = await authenticatedFetch("/api/factory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(factory),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setFactory(data.factory);
      alert("Factory updated successfully");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading factory settings...</div>;
  }

  return (
    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Factory Settings
          </h1>
          <p className="text-gray-600">
            Manage your factory information
          </p>
        </div>
        <Link
          href="/pricing"
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
        >
          Subscriptions
        </Link>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        {/* FACTORY NAME */}
        <input
          className="text-black w-full border p-2 rounded"
          value={factory?.name || ""}
          onChange={(e) =>
            setFactory({ ...factory, name: e.target.value })
          }
          placeholder="Factory Name"
        />

        {/* EMAIL (READ ONLY) */}
        <input
          className="text-black w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
          value={factory?.email || ""}
          disabled
        />
        {/* PHONE */}
<input
  className="text-black w-full border p-2 rounded"
  value={factory?.phone || ""}
  onChange={(e) =>
    setFactory({ ...factory, phone: e.target.value })
  }
  placeholder="Phone Number"
/>

        {/* ADDRESS */}
        <textarea
          className="text-black w-full border p-2 rounded"
          value={factory?.address || ""}
          onChange={(e) =>
            setFactory({ ...factory, address: e.target.value })
          }
          placeholder="Factory Address"
        />

        {/* CITY */}
        <input
          className="text-black w-full border p-2 rounded"
          value={factory?.city || ""}
          onChange={(e) =>
            setFactory({ ...factory, city: e.target.value })
          }
          placeholder="City"
        />

        {/* COUNTRY */}
        <input
          className="text-black w-full border p-2 rounded"
          value={factory?.country || ""}
          onChange={(e) =>
            setFactory({ ...factory, country: e.target.value })
          }
          placeholder="Country"
        />

        {/* SUBSCRIPTION */}
        <input
          className="text-black w-full border p-2 rounded"
          value={factory?.subscription_plan || ""}
          onChange={(e) =>
            setFactory({
              ...factory,
              subscription_plan: e.target.value,
            })
          }
          placeholder="Subscription Plan"
        />

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}