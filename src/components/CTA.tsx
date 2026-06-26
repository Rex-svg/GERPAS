"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <div className="py-20 px-4 bg-linear-to-r from-emerald-100 to-teal-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Ready to transform your factory?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join 2,500+ garment factories that are already using GERPAS to streamline operations and increase efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
            >
              <Link href="/register">Start Your Free Trial</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full font-semibold text-emerald-600 border-2 border-emerald-300 hover:bg-emerald-100 transition-all"
            >
              Login
            </motion.button>
          </div>

          <p className="text-sm text-gray-600 pt-4">
            No credit card required • 3-day free trial • Full money-back guarantee
          </p>
        </motion.div>
      </div>
    </div>
  );
}
