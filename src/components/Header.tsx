"use client";

import Link from "next/link";
import { useUser } from "@/lib/useUser";
import { motion } from "framer-motion";

export default function Header() {
  const { isSignedIn, isLoading, logout } = useUser();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition">
              GERPAS
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Pricing
            </Link>
            <Link href="#features" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Features
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-emerald-600 font-semibold hover:text-emerald-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 font-semibold hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 font-semibold hover:text-gray-900 transition"
                >
                  Sign In
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
