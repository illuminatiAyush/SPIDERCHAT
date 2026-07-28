"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import Image from "next/image";
import { Zap, Users, MessageSquare, Rocket, Share2, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { text: "Live Typing", icon: <MousePointer2 size={18} /> },
  { text: "Presence", icon: <Users size={18} /> },
  { text: "Replies", icon: <MessageSquare size={18} /> },
  { text: "Instant Delivery", icon: <Rocket size={18} /> },
  { text: "Room Invites", icon: <Share2 size={18} /> },
  { text: "Zero Refresh", icon: <Zap size={18} /> },
];

export default function MomentsAlive() {
  return (
    <section className="mt-32 w-full px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Left: Large comic artwork / mockup */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2"
        >
          <div className="relative w-full aspect-square md:aspect-[4/5] bg-spider-red border-4 border-black comic-shadow overflow-hidden group">
            <div className="absolute inset-0 halftone-bg opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* Fake UI mockup inside the comic panel */}
              <div className="w-full h-full border-4 border-black bg-white flex flex-col transform group-hover:scale-[1.02] transition-transform duration-500 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="border-b-4 border-black p-3 bg-spider-black text-white flex justify-between items-center">
                  <div className="font-bebas text-xl tracking-wider">EARTH-1610</div>
                  <Users size={16} />
                </div>
                <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
                   <div className="self-start bg-spider-blue text-white border-2 border-black p-2 max-w-[80%] rounded-tr-xl rounded-br-xl rounded-bl-xl font-fredoka text-sm comic-shadow-sm transform -rotate-1">
                      Anyone want to hunt some anomalies?
                   </div>
                   <div className="self-end bg-spider-red text-white border-2 border-black p-2 max-w-[80%] rounded-tl-xl rounded-bl-xl rounded-br-xl font-fredoka text-sm comic-shadow-sm transform rotate-1">
                      Count me in. Meet at Alchemax?
                   </div>
                   <motion.div 
                     animate={{ opacity: [0.5, 1, 0.5] }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                     className="absolute bottom-4 left-4 text-xs font-bebas text-black/50"
                   >
                     Gwen is typing...
                   </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Animated feature list */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="flex flex-wrap gap-3 mb-8">
            <GlitchText text="MOMENTS" textColorClass="text-foreground" className="text-5xl md:text-7xl" />
            <GlitchText text="THAT FEEL" textColorClass="text-foreground" className="text-5xl md:text-7xl" />
            <GlitchText text="ALIVE" textColorClass="text-spider-red" className="text-5xl md:text-7xl" />
          </div>

          <div className="flex flex-col gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                whileHover={{ x: 10 }}
                className={cn(
                  "flex items-center gap-4 bg-white border-4 border-black p-4 comic-shadow cursor-pointer transition-transform text-black",
                  i % 2 === 0 ? "hover:bg-spider-red hover:text-white" : "hover:bg-spider-blue hover:text-white"
                )}
              >
                <div className="bg-black text-white p-2 border-2 border-transparent">
                  {feature.icon}
                </div>
                <h4 className="font-bebas text-2xl tracking-wide">
                  {feature.text}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
