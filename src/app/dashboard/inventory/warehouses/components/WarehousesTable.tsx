"use client";

import React, { useEffect, useState } from "react";

export default function WarehousesTable() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/warehouses");
      const data = await res.json();
      setList(data.warehouses || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const save = async (payload: any) => {
    try {
      const method = payload.id ? "PUT" : "POST";
      const url = payload.id ? `/api/inventory/warehouses/${payload.id}` : "/api/inventory/warehouses";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed");
      fetchList(); setEditing(null);
    } catch (err) { alert((err as any).message || "Failed"); }
  };

  const del = async (id: string) => { if (!confirm("Delete warehouse?")) return; const res = await fetch(`/api/inventory/warehouses/${id}`, { method: "DELETE" }); if (!res.ok) { alert("Failed"); return; } fetchList(); };

  return (
    <div className="text-black bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Warehouses</h3><button onClick={() => setEditing({})} className="px-3 py-2 rounded bg-emerald-600 text-white">Add</button></div>
      {loading ? <div className="py-6 text-gray-500">Loading...</div> : (
        <table className="w-full text-left"><thead className="border-b"><tr><th className="py-2 px-3">Name</th><th className="py-2 px-3">Address</th><th className="py-2 px-3">Actions</th></tr></thead><tbody>{list.map(w=> (<tr key={w.id} className="border-b hover:bg-gray-50"><td className="py-2 px-3">{w.name}</td><td className="py-2 px-3">{w.address}</td><td className="py-2 px-3"><div className="flex gap-2"><button onClick={()=>setEditing(w)} className="px-2 py-1 rounded bg-blue-600 text-white">Edit</button><button onClick={()=>del(w.id)} className="px-2 py-1 rounded border">Delete</button></div></td></tr>))}</tbody></table>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-lg w-full max-w-md p-6"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold">{editing.id ? 'Edit' : 'New'} Warehouse</h4><button onClick={()=>setEditing(null)}>✕</button></div><div className="space-y-3"><input defaultValue={editing.name} placeholder="Name" onChange={(e)=>setEditing((s:any)=>({...s,name:e.target.value}))} className="w-full rounded border px-3 py-2" /><textarea defaultValue={editing.address} placeholder="Address" onChange={(e)=>setEditing((s:any)=>({...s,address:e.target.value}))} className="w-full rounded border px-3 py-2" /><div className="flex items-center gap-3"><button onClick={()=>save(editing)} className="px-3 py-2 rounded bg-emerald-600 text-white">Save</button><button onClick={()=>setEditing(null)} className="px-3 py-2 rounded border">Cancel</button></div></div></div></div>
      )}
    </div>
  );
}
