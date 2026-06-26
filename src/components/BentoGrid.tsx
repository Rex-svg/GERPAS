"use client";

import { motion } from "framer-motion";

const features = [
  { title: "Real-time Inventory", description: "Live tracking across all stations", icon: "📊" },
  { title: "Smart Production", description: "Advance scheduling", icon: "🤖" },
  { title: "Global Exports", description: "Customs compliance built-in", icon: "🌍" },
  { title: "Mobile Dashboard", description: "Full control from anywhere", icon: "📱" },
  { title: "Team Collaboration", description: "Unified workspace", icon: "👥" },
  { title: "API Integration", description: "Connect with your tools", icon: "🔗" },
];

export default function BentoGrid() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A complete suite of tools designed for modern garment factories
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item} whileHover={{ y: -4 }}>
              <div className="h-full p-6 rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-white hover:border-emerald-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
