"use client";

import Header from "@/components/Header"
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import SocialProof from "@/components/SocialProof";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <BentoGrid />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
