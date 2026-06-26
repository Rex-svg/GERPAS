import Link from "next/link";

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4 py-24">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl border border-red-100 p-10 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          Something went wrong while processing your payment. Please try again or contact support.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-white font-semibold hover:bg-red-700 transition"
        >
          Return to Pricing
        </Link>
      </div>
    </div>
  );
}
