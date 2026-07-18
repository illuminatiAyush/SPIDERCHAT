"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
          <Shield className="w-20 h-20 mx-auto text-spider-blue mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <GlitchText 
            text="PRIVACY PROTOCOLS" 
            textColorClass="text-spider-blue"
            className="text-6xl md:text-8xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider"
          />
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="comic-panel bg-spider-white text-spider-black p-8 md:p-12"
        >
          <div className="space-y-8 font-fredoka text-lg">
            <section>
              <h2 className="font-bebas text-3xl text-spider-red mb-4">01. THE ALCHEMAX AGREEMENT</h2>
              <p>
                Unlike certain multi-dimensional corporations, SpiderChat does not harvest your neural data. We believe in absolute anonymity across the multiverse. When you create a temporary room, your data exists only as long as the temporal anomaly (the room) remains open.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">02. KLYNTAR SYMBIOTE TRACKING</h2>
              <p>
                We do not use invasive tracking symbiotes. The only cookies we use are strictly necessary to maintain your session integrity while traversing dimensional rifts (navigating the app). No third-party ad networks will follow you back to Earth-616.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-red mb-4">03. SECURE WEB-SHOOTERS</h2>
              <p>
                All direct messages and room communications are transmitted via high-tensile, securely encrypted WebSockets. Even Madame Web cannot peek into your private dimensional chats unless you invite her.
              </p>
            </section>
            
            <section>
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">04. IDENTITY CONCEALMENT</h2>
              <p>
                A mask is a hero's best friend. You are never required to reveal your true identity. You can remain completely anonymous, using aliases like "Miles", "Gwen", or "Spider-Ham" without any friction. 
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
