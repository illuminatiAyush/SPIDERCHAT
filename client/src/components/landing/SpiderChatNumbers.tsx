"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { GlitchText } from "@/components/GlitchText";

const stats = [
  { prefix: "", number: 100, suffix: "+", label: "Heroes per Room", color: "spider-red" },
  { prefix: "<", number: 50, suffix: "ms", label: "Latency", color: "spider-blue" },
  { prefix: "", number: 0, suffix: " Lag", label: "Socket.IO Powered", color: "black" },
];

function AnimatedCounter({ endValue, duration = 2 }: { endValue: number, duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = (time - startTime) / (duration * 1000);
        if (progress < 1) {
          setValue(Math.min(Math.floor(progress * endValue), endValue));
          requestAnimationFrame(animate);
        } else {
          setValue(endValue);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, endValue, duration]);

  return <span ref={ref}>{value}</span>;
}

export default function SpiderChatNumbers() {
  return (
    <section className="mt-32 w-full px-4 max-w-6xl mx-auto">
      <div className="flex justify-center flex-wrap gap-4 mb-20">
        <GlitchText text="BY THE" textColorClass="text-foreground" className="text-5xl md:text-6xl" />
        <GlitchText text="NUMBERS" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
        {/* Background connector line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-2 bg-black/10 transform -translate-y-1/2 z-0" />

        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className={cn(
              "flex flex-col items-center justify-center p-8 border-4 border-black bg-white comic-shadow relative z-10",
              stat.color === "spider-red" ? "hover:shadow-[4px_4px_0_0_rgba(230,57,70,1)]" : 
              stat.color === "spider-blue" ? "hover:shadow-[4px_4px_0_0_rgba(69,123,157,1)]" : 
              "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            )}
          >
            <div className={cn(
              "font-bebas text-6xl md:text-8xl mb-2 flex items-center gap-1",
              stat.color === "spider-red" ? "text-spider-red" : 
              stat.color === "spider-blue" ? "text-spider-blue" : "text-black"
            )}>
              {stat.prefix}
              {stat.number > 0 ? <AnimatedCounter endValue={stat.number} /> : "ZERO"}
              {stat.suffix}
            </div>
            
            <div className="w-full h-1 bg-black my-4 transform -skew-x-12 opacity-20" />
            
            <div className="font-fredoka text-xl md:text-2xl font-bold uppercase tracking-wider text-black text-center">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
