"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityPage() {
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
          <Lock className="w-20 h-20 mx-auto text-spider-blue mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <GlitchText 
            text="SECURITY PROTOCOLS" 
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
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">01. END-TO-END ENCRYPTION</h2>
              <p>
                All messages traveling through the Web of Life and Destiny are encrypted using state-of-the-art WebSockets. Only the sender and the receiver have the keys to decipher the data. Kingpin's servers can't intercept your packets.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-red mb-4">02. TEMPORAL ANOMALY PROTECTION</h2>
              <p>
                Our servers are isolated against temporal manipulation. We utilize strict rate-limiting and DDOS protection via Web Application Firewalls to ensure the stability of all chat instances across Earth-616 and beyond.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">03. ZERO DATA RETENTION (ANONYMOUS)</h2>
              <p>
                For anonymous rooms, your messages are held entirely in volatile memory. The moment the room collapses (when all users disconnect), the data ceases to exist in our timeline. No chat logs, no backups, no traces.
              </p>
            </section>
            
            <section>
              <h2 className="font-bebas text-3xl text-spider-red mb-4">04. VULNERABILITY REPORTING</h2>
              <p>
                If you locate a breach in our dimensional walls, report it immediately to the Guy in the Chair. We reward friendly neighborhood hackers who practice responsible disclosure.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
