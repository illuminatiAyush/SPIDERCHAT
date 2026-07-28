"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { Users, MessageSquare, Plus, Ghost, Flame } from "lucide-react";

const events = [
  { text: "Ayush joined Earth-1610", icon: <Users size={16} className="text-spider-blue" /> },
  { text: "Gwen replied to Peter", icon: <MessageSquare size={16} className="text-spider-red" /> },
  { text: "Miles created a room", icon: <Plus size={16} className="text-black" /> },
  { text: "Venom invited 4 heroes", icon: <Flame size={16} className="text-spider-red" /> },
  { text: "482 conversations today", icon: <Ghost size={16} className="text-spider-blue" /> },
];

export default function LiveActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-8 border-y-4 border-black bg-spider-red/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-4 px-4">
      <div className="flex items-center gap-3 font-bebas text-2xl text-foreground">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spider-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-spider-red"></span>
        </span>
        LIVE ACROSS THE MULTIVERSE:
      </div>
      
      <div className="h-10 w-full md:w-[350px] relative flex items-center justify-center md:justify-start">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="absolute flex items-center gap-2 bg-spider-white border-2 border-black px-4 py-2 comic-shadow-sm font-fredoka font-medium text-black"
          >
            {events[currentIndex].icon}
            {events[currentIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
