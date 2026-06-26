import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Sales</h1>
        <p className="text-slate-600 mb-8">
          For enterprise pricing and custom integrations, please email us at <strong>sales@gerpas.com</strong> or use the form below.
        </p>

        <div className="grid gap-6">
          <a
            href="mailto:sales@gerpas.com"
            className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
          >
            Email Sales
          </a>

          <Link
            href="/pricing"
            className="rounded-3xl border border-slate-200 px-6 py-4 text-slate-900 font-semibold hover:bg-slate-100 transition"
          >
            Return to Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
