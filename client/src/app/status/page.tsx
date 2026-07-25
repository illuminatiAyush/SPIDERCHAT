"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, Activity, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function StatusPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network checking
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-x-hidden halftone-bg">
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 font-bebas text-xl text-spider-black bg-spider-white border-2 border-black px-4 py-2 hover:bg-spider-blue hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={20} /> BACK TO BASE
        </Link>
      </div>

      <div className="z-10 w-full max-w-4xl mt-16 md:mt-24">
        <div className="text-center mb-12">
          <Activity className="w-20 h-20 mx-auto text-green-500 mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-pulse" />
          <GlitchText 
            text="NETWORK STATUS" 
            textColorClass="text-green-500"
            className="text-6xl md:text-8xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider"
          />
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="comic-panel bg-spider-white text-spider-black p-8 md:p-12"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-spider-black border-t-green-500 rounded-full animate-spin" />
              <h2 className="font-bebas text-2xl animate-pulse">SCANNING DIMENSIONAL NODES...</h2>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border-2 border-spider-black bg-green-500/10">
                <div className="flex items-center gap-4">
                  <Check className="text-green-600 w-8 h-8" />
                  <h3 className="font-bebas text-2xl">Earth-616 Routing</h3>
                </div>
                <span className="font-fredoka font-bold text-green-600">OPERATIONAL</span>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-spider-black bg-green-500/10">
                <div className="flex items-center gap-4">
                  <Check className="text-green-600 w-8 h-8" />
                  <h3 className="font-bebas text-2xl">Web-Shooter Socket API</h3>
                </div>
                <span className="font-fredoka font-bold text-green-600">OPERATIONAL</span>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-spider-black bg-green-500/10">
                <div className="flex items-center gap-4">
                  <Check className="text-green-600 w-8 h-8" />
                  <h3 className="font-bebas text-2xl">Symbiote Firewall</h3>
                </div>
                <span className="font-fredoka font-bold text-green-600">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-spider-black bg-green-500/10">
                <div className="flex items-center gap-4">
                  <Check className="text-green-600 w-8 h-8" />
                  <h3 className="font-bebas text-2xl">Dimensional Rifts (Databases)</h3>
                </div>
                <span className="font-fredoka font-bold text-green-600">STABLE</span>
              </div>

              <div className="mt-8 p-4 border-l-4 border-green-500 bg-gray-100">
                <p className="font-fredoka text-sm text-gray-700">
                  Last updated: Just now. All systems in the multiverse are currently functioning normally. No anomalies detected.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
