"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { cn } from "@/lib/utils";
import Image from "next/image";

const testimonials = [
  { 
    quote: "This feels like Discord inside the Spider-Verse.",
    author: "Miles",
    role: "Earth-1610",
    color: "spider-red"
  },
  { 
    quote: "The smoothest room chat I've ever used for our band.",
    author: "Gwen",
    role: "Earth-65",
    color: "spider-blue"
  },
  { 
    quote: "Comic UI is insane. Zero lag during massive events.",
    author: "Miguel",
    role: "Earth-928",
    color: "black"
  }
];

export default function CommunityTestimonials() {
  return (
    <section className="mt-32 w-full px-4 max-w-7xl mx-auto py-16">
      <div className="flex justify-center flex-wrap gap-4 mb-20">
        <GlitchText text="HEROES" textColorClass="text-foreground" className="text-5xl md:text-6xl" />
        <GlitchText text="SPEAK" textColorClass="text-spider-blue" className="text-5xl md:text-6xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 px-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center group relative cursor-pointer"
          >
            {/* Speech Bubble */}
            <div className={cn(
              "relative bg-white border-4 border-black p-6 rounded-2xl rounded-br-none comic-shadow mb-6 z-10 w-full transition-all duration-300",
              t.color === "spider-red" ? "hover:border-spider-red" :
              t.color === "spider-blue" ? "hover:border-spider-blue" : "hover:border-black"
            )}>
              <p className="font-fredoka text-lg md:text-xl font-medium text-black italic">
                "{t.quote}"
              </p>
              
              {/* Bubble Tail */}
              <div className="absolute -bottom-4 right-0 w-8 h-8 overflow-hidden">
                <div className="w-16 h-16 bg-white border-4 border-black rounded-full absolute -top-12 -left-8" />
              </div>
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center gap-4 self-end mr-4">
              <div className="text-right">
                <div className="font-bebas text-xl text-foreground">{t.author}</div>
                <div className={cn(
                  "font-fredoka text-sm font-bold uppercase",
                  t.color === "spider-red" ? "text-spider-red" :
                  t.color === "spider-blue" ? "text-spider-blue" : "text-foreground/70"
                )}>
                  {t.role}
                </div>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-bebas text-2xl text-white comic-shadow-sm",
                t.color === "spider-red" ? "bg-spider-red" :
                t.color === "spider-blue" ? "bg-spider-blue" : "bg-black"
              )}>
                {t.author[0]}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
