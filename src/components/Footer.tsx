"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-white text-sm">
                G
              </div>
              <span className="font-bold text-gray-900">GERPAS</span>
            </div>
            <p className="text-sm text-gray-600">The First Web ERP for garment factories worldwide.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="text-gray-600 hover:text-emerald-600 transition">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-emerald-600 transition">Pricing</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Security</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#about" className="text-gray-600 hover:text-emerald-600 transition">About</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Blog</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Privacy</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Terms</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-emerald-600 transition">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-gray-200 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <p>GERPAS.A Quality Product made by Shahriar 👾</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-emerald-600 transition">Twitter</Link>
            <Link href="#" className="hover:text-emerald-600 transition">LinkedIn</Link>
            <Link href="#" className="hover:text-emerald-600 transition">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
