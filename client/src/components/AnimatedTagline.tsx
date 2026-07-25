"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const taglines = [
  "Enter the Multiverse of Conversations.",
  "Every Hero Has a Story. Start Yours.",
  "Your Friendly Neighborhood Chat Awaits.",
  "Across Every Universe, Stay Connected.",
  "Assemble Your Multiverse Squad.",
  "Messages Faster Than a Spider-Sense.",
  "One Web. Infinite Conversations."
];

export function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative font-fredoka text-xl md:text-3xl text-spider-white italic mb-12 transform -rotate-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] h-8 md:h-10 flex items-center justify-center overflow-visible w-full">
      <AnimatePresence>
        <motion.p
          key={index}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, rotateX: 90, scale: 0.95, filter: "blur(4px)" }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, rotateX: 0, scale: 1, filter: "blur(0px)" }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, rotateX: -90, scale: 0.95, filter: "blur(4px)" }
          }
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="absolute whitespace-nowrap text-center"
          style={{ transformOrigin: "center" }}
        >
          {taglines[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
