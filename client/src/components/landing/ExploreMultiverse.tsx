"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { cn } from "@/lib/utils";

const dimensions = [
  { name: "Earth-1610", desc: "Student Discussions", color: "spider-red", icon: "🕸" },
  { name: "Earth-42", desc: "Gaming Arena", color: "spider-blue", icon: "🎮" },
  { name: "Alchemax", desc: "Tech Community", color: "spider-black", icon: "🏢" },
  { name: "Daily Bugle", desc: "Memes & News", color: "spider-red", icon: "📰" },
  { name: "MCU", desc: "Movies & Series", color: "spider-blue", icon: "🎬" },
  { name: "Earth-65", desc: "Music Lounge", color: "spider-black", icon: "🎵" },
];

export default function ExploreMultiverse() {
  return (
    <section className="mt-32 w-full px-4 py-16 bg-spider-black/5 relative overflow-hidden">
      <div className="flex justify-center flex-wrap gap-4 mb-4 relative z-10">
        <GlitchText text="EXPLORE THE" textColorClass="text-foreground" className="text-5xl md:text-6xl" />
        <GlitchText text="MULTIVERSE" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
      </div>
      <p className="text-center font-fredoka text-xl text-foreground/80 mb-12 max-w-2xl mx-auto relative z-10">
        Every room is a different dimension. Where will you jump next?
      </p>

      <div className="flex flex-wrap justify-center gap-6 relative z-10">
        {dimensions.map((dim, i) => (
          <motion.div
            key={dim.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2, y: -10 }}
            className={cn(
              "w-full sm:w-[300px] border-4 border-black p-6 cursor-pointer comic-shadow group relative overflow-hidden transition-all duration-300",
              dim.color === "spider-red" ? "bg-spider-red hover:shadow-[0_0_30px_rgba(230,57,70,0.6)] text-white" : 
              dim.color === "spider-blue" ? "bg-spider-blue hover:shadow-[0_0_30px_rgba(69,123,157,0.6)] text-white" : 
              "bg-spider-black hover:shadow-[0_0_30px_rgba(0,0,0,0.6)] text-white"
            )}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
            
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 origin-left">
              {dim.icon}
            </div>
            <h3 className="font-bebas text-3xl mb-2 text-white">
              {dim.name}
            </h3>
            <p className="font-fredoka text-white/90 font-medium">{dim.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
