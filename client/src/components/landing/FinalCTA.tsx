"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FinalCTA() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = () => {
    setIsCreating(true);

    const heroNames = ["Peter", "Miles", "Gwen", "Miguel", "Pavitr", "Hobie", "SpiderNoir", "PennyParker"];
    const randomHero = heroNames[Math.floor(Math.random() * heroNames.length)] + "_" + Math.floor(100 + Math.random() * 900);
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem("spiderchat_username") : null;
    const alias = stored || randomHero;

    if (typeof window !== 'undefined') {
      let guestId = sessionStorage.getItem("spiderchat_guest_id");
      if (!guestId) {
        guestId = `anon_${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem("spiderchat_guest_id", guestId);
      }
      sessionStorage.setItem("spiderchat_username", alias);
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    router.push(`/room/${roomCode}`);
  };

  return (
    <section className="mt-32 w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-spider-black border-t-8 border-spider-red pt-32 pb-48">
      {/* Animated Web Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none bg-[url('/web-pattern.png')] bg-cover bg-center" 
      />

      {/* Halftone Overlay */}
      <div className="absolute inset-0 halftone-bg opacity-30 mix-blend-overlay pointer-events-none" />

      {/* Comic Lighting / Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-spider-red rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-12"
        >
          <div className="flex flex-col items-center justify-center space-y-2 mb-8">
            <GlitchText text="READY TO ENTER" textColorClass="text-white" className="text-6xl md:text-8xl lg:text-9xl font-bebas tracking-wider" />
            <GlitchText text="THE MULTIVERSE?" textColorClass="text-spider-red" className="text-6xl md:text-8xl lg:text-9xl font-bebas tracking-wider" />
          </div>
          
          <p className="font-fredoka text-white/80 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
            Join thousands of heroes already communicating across dimensions. No registration required.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/join"
              className="comic-button block w-full text-center py-5 px-12 bg-spider-blue text-white text-2xl skew-x-[-6deg]"
            >
              JOIN ROOM
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className={`comic-button w-full py-5 px-12 flex items-center justify-center gap-2 bg-spider-red text-white text-2xl skew-x-[-6deg] ${isCreating ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isCreating ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin opacity-70" />
                  <span className="text-white/90">ACTIVATING...</span>
                </>
              ) : (
                "CREATE ROOM"
              )}
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative spider at the bottom before footer transition */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-16 h-16 rounded-full bg-spider-red border-4 border-black flex items-center justify-center comic-shadow shadow-[0_0_20px_rgba(230,57,70,0.5)]">
           <span className="text-white text-3xl">🕷</span>
        </div>
      </motion.div>
    </section>
  );
}
