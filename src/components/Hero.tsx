"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import heroImage from "@/assets/hero-new.jpg";

export default function Hero() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src={heroImage}
        alt="Hero background"
        fill
        className="absolute inset-0 object-cover object-center"
        priority
      />
      
      {/* Dark overlay with transparency */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 w-full pb-20 px-4 mt-20">
        <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block"
          >
            <div className="px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium">
              ✨ The future of garment manufacturing
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            Real-time control over
            <span className="bg-linear-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"> your entire factory</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed"
          >
            One unified platform for inventory tracking, production scheduling, and global exports. Built specifically for the modern garment factory.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
            >
              <Link href="/register">Start Your 3-Day Trial</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full font-semibold text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
            >
              <Link href="/demo">View Demo</Link>
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-8 text-gray-200 text-sm"
          >
            <p>Trusted by 2,500+ garment factories worldwide</p>
          </motion.div>
        </motion.div>

        {/* Subtle decorative elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-10 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.2 }}
          className="absolute bottom-20 left-10 w-40 h-40 bg-teal-100/20 rounded-full blur-3xl"
        />
        </div>
      </div>
    </div>
  );
}
