"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-x-hidden halftone-bg">
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 font-bebas text-xl text-spider-black bg-spider-white border-2 border-black px-4 py-2 hover:bg-spider-red hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={20} /> BACK TO BASE
        </Link>
      </div>

      <div className="z-10 w-full max-w-4xl mt-16 md:mt-24">
        <div className="text-center mb-12">
          <Headphones className="w-20 h-20 mx-auto text-spider-red mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <h1 className="flex flex-col items-center">
            <span className="sr-only">Spider Support — Guy in the Chair Multiverse Help</span>
            <GlitchText 
              text="SPIDER SUPPORT" 
              textColorClass="text-spider-red"
              className="text-6xl md:text-8xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider"
            />
          </h1>
          <p className="font-fredoka text-xl text-spider-black mt-4 italic">Guy in the chair, standing by.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="comic-panel bg-spider-blue text-white p-8"
          >
            <h2 className="font-bebas text-4xl mb-4">DIMENSIONAL GLITCHES?</h2>
            <p className="font-fredoka text-lg mb-6">
              If your chat rooms are collapsing or you're experiencing severe lag in the multiverse continuum, don't panic. Our Web-Weavers are on standby to patch any anomalies.
            </p>
            <Link 
              href="/feedback" 
              className="comic-button bg-spider-white text-spider-black w-full py-4 text-xl hover:bg-spider-red hover:text-white block text-center"
            >
              REPORT AN ANOMALY
            </Link>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="comic-panel bg-spider-red text-white p-8"
          >
            <h2 className="font-bebas text-4xl mb-4">LOST YOUR SUIT?</h2>
            <p className="font-fredoka text-lg mb-6">
              Forgot your login credentials? Can't access your encrypted dashboard? Send a distress signal to HQ and we'll help you recover your secret identity.
            </p>
            <Link 
              href="/forgot-password" 
              className="comic-button bg-spider-black text-white w-full py-4 text-xl hover:bg-spider-blue block text-center"
            >
              RECOVER CREDENTIALS
            </Link>
          </motion.div>
        </div>
        
        <div className="mt-12 text-center bg-spider-white text-spider-black p-6 border-4 border-black rounded-xl comic-panel shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
           <h3 className="font-bebas text-3xl text-spider-black mb-2">DIRECT COMM-LINK</h3>
           <p className="font-fredoka text-spider-black/90 text-lg">
             For extreme emergencies, contact the Spider Society HQ at: <br/>
             <span className="text-spider-blue font-bold tracking-wider">SUPPORT@SPIDERCHAT.MULTIVERSE</span>
           </p>
        </div>
      </div>
    </main>
  );
}
