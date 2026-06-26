"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 10000,
    price: "10,000 tk",
    period: "/month",
    description: "Perfect for small factories",
    features: [
      "Up to 100 orders/month",
      "Basic inventory tracking",
      "3 user accounts",
      "Email support",
      "Basic reporting",
      "7-day data retention",
    ],
    cta: "BUY NOW",
    highlighted: false,
    stripeId: "price_starter_monthly",
  },
  {
    name: "Professional",
    monthlyPrice: 35000,
    price: "35,000 tk",
    period: "/month",
    description: "For growing factories",
    features: [
      "Up to 1,000 orders/month",
      "Advanced inventory management",
      "Unlimited user accounts",
      "Priority email support",
      "Advanced analytics",
      "90-day data retention",
      "Custom reports",
      "API access",
    ],
    cta: "BUY NOW",
    highlighted: true,
    stripeId: "price_professional_monthly",
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    price: "Custom",
    period: "pricing",
    description: "For large-scale operations",
    features: [
      "Unlimited orders",
      "White-label solution",
      "Unlimited users",
      "24/7 phone support",
      "Custom integrations",
      "Unlimited data retention",
      "Advanced analytics",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
    stripeId: "price_enterprise_contact",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout(plan: typeof plans[number]) {
    if (plan.stripeId === "price_enterprise_contact") {
      router.push("/contact");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/payments/sslcommerz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          amount: billingCycle === "yearly" ? Math.round((plan.monthlyPrice || 0) * 12 * 0.8) : plan.monthlyPrice,
          billingCycle,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment checkout failed");
      }

      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to start payment checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-emerald-50/30 to-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent <span className="text-emerald-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Choose the perfect plan for your factory. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingCycle === "yearly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Yearly <span className="text-xs ml-2">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl transition-all ${
                plan.highlighted
                  ? "ring-2 ring-emerald-600 shadow-2xl scale-105"
                  : "shadow-lg hover:shadow-xl"
              } ${plan.highlighted ? "bg-linear-to-br from-emerald-600 to-teal-600 text-white" : "bg-white"}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-emerald-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    {plan.monthlyPrice && billingCycle === "yearly"
                      ? `${(plan.monthlyPrice * 0.8).toLocaleString()} tk`
                      : plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-emerald-100" : "text-zinc-950"}`}>
                    {plan.period}
                  </span>
                </div>

                {/* CTA Button */}
                <motion.button
                  type="button"
                  onClick={() => handleCheckout(plan)}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                    plan.highlighted
                      ? "bg-white text-emerald-600 hover:bg-gray-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? "Processing..." : plan.cta}
                </motion.button>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 ${plan.highlighted ? "text-emerald-100" : "text-emerald-600"}`}>
                        ✓
                      </div>
                      <span className={`text-sm ${plan.highlighted ? "text-emerald-50" : "text-gray-700"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and bank transfers for Enterprise plans.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees! You can start using GERPAS immediately after registration.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes! Annual plans come with a 20% discount compared to monthly billing.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center bg-linear-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Factory?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
          >
            <Link href="/auth/register">Get Started Free</Link>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
