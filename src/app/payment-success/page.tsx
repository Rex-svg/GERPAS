import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4 py-24">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl border border-emerald-100 p-10 text-center">
        <h1 className="text-4xl font-bold text-emerald-700 mb-4">Payment Successful</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your payment was completed successfully.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
