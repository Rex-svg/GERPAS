"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import socialProofImage from "@/assets/socialpoof.jpg";

const factories = ["Dhaka Apparels", "Global Knits", "PSTU Textiles", "Fashion Hub", "Premium Garments"];

export default function SocialProof() {
  return (
    <div className="relative w-full py-16 px-4 overflow-hidden border-y border-gray-200">
      {/* Background Image */}
      <Image
        src={socialProofImage}
        alt="Social proof background"
        fill
        className="absolute inset-0 object-cover"
        priority
      />
      
      {/* Dark overlay with transparency */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-emerald-300 mb-2">TRUSTED BY LEADING FACTORIES</p>
            <h2 className="text-3xl font-bold text-white">2,500+ Factories Running GERPAS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "2,500+", label: "Active Factories" },
              { number: "150K+", label: "Daily Orders" },
              { number: "98.5%", label: "Uptime" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold bg-linear-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-200">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
