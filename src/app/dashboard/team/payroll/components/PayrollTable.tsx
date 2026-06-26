"use client";

type PayrollTableProps = {
  payrolls: Array<{ id: string; month: string; net_salary: number; payment_status: string; employee?: { full_name: string; employee_code: string } }>;
  loading: boolean;
  error: string | null;
};

export default function PayrollTable({ payrolls, loading, error }: PayrollTableProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
      ) : loading ? (
        <div className="py-12 text-center text-gray-500">Loading payroll history…</div>
      ) : payrolls.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No payroll records found. Create your first payroll entry.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Employee</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Month</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Net Salary</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{record.employee?.full_name ?? "Unknown"}</div>
                    <div className="text-xs text-gray-500">{record.employee?.employee_code ?? "—"}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{record.month}</td>
                  <td className="px-4 py-4 text-gray-900">Tk{record.net_salary.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${record.payment_status === "Paid" ? "bg-emerald-100 text-emerald-800" : record.payment_status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-700"}`}>
                      {record.payment_status}
                    </span>
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
