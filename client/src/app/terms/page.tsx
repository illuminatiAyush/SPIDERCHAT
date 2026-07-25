"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
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
          <FileText className="w-20 h-20 mx-auto text-spider-red mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <GlitchText 
            text="TERMS OF SERVICE" 
            textColorClass="text-spider-red"
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
              <h2 className="font-bebas text-3xl text-spider-red mb-4">01. DIMENSIONAL LIABILITY</h2>
              <p>
                By using SpiderChat, you acknowledge that we are not responsible for any multiversal rifts, temporal anomalies, or variants of yourself that you may encounter. Use the network at your own risk across all universes.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">02. ACCEPTABLE USE</h2>
              <p>
                No inciting violence, plotting against Spider-Society, or organizing Sinister Six meetings. The network is for friendly neighborhood communication only. Keep your chats civil and respectful of all dimensions.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-3xl text-spider-red mb-4">03. SYMBIOTE BAN</h2>
              <p>
                The transmission of alien symbiote code, malicious scripts, or any digital equivalent of Venom/Carnage is strictly prohibited. Violators will be immediately localized and banned from the network by Miguel O'Hara's strike team.
              </p>
            </section>
            
            <section>
              <h2 className="font-bebas text-3xl text-spider-blue mb-4">04. ACCOUNT TERMINATION</h2>
              <p>
                We reserve the right to collapse your chat dimension at any time if we detect violations of these terms. Temporary anonymous rooms naturally collapse when all participants leave the dimension.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
