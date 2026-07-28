"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { cn } from "@/lib/utils";
import { Zap, MessageCircle, Moon, Shield, Link2, Ghost } from "lucide-react";

const features = [
  { title: "LIVE ROOMS", desc: "Instant WebSockets. Zero refresh.", icon: <Zap size={24} />, color: "spider-red", span: "col-span-1 md:col-span-2" },
  { title: "DIRECT MSGS", desc: "1-on-1 private chats.", icon: <MessageCircle size={24} />, color: "spider-blue", span: "col-span-1" },
  { title: "REPLIES", desc: "Threaded context.", icon: <MessageCircle size={24} />, color: "black", span: "col-span-1" },
  { title: "DARK MODE", desc: "For the night owls.", icon: <Moon size={24} />, color: "spider-red", span: "col-span-1 md:col-span-2" },
  { title: "MODERATION", desc: "Kick, ban, & slow mode.", icon: <Shield size={24} />, color: "spider-blue", span: "col-span-1 md:col-span-2" },
  { title: "INVITE SYSTEM", desc: "Share link to join.", icon: <Link2 size={24} />, color: "black", span: "col-span-1" },
  { title: "GUEST MODE", desc: "No account? No problem.", icon: <Ghost size={24} />, color: "spider-red", span: "col-span-1 md:col-span-3" },
];

export default function FeaturesComicGrid() {
  return (
    <section className="mt-32 w-full px-4 max-w-6xl mx-auto">
      <div className="flex justify-center flex-wrap gap-4 mb-12">
        <GlitchText text="SPIDER" textColorClass="text-foreground" className="text-5xl md:text-6xl" />
        <GlitchText text="ARSENAL" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-white p-6 border-4 border-black comic-shadow">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={cn(
              "group p-6 border-4 border-black bg-spider-white overflow-hidden relative cursor-pointer",
              feature.span,
              "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-200"
            )}
          >
            {/* Halftone background on hover */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 halftone-bg",
              feature.color === "spider-red" ? "bg-spider-red" : 
              feature.color === "spider-blue" ? "bg-spider-blue" : "bg-black"
            )} />

            <div className={cn(
              "absolute -bottom-10 -right-10 opacity-10 transform group-hover:scale-150 group-hover:rotate-12 transition-all duration-500",
              feature.color === "spider-red" ? "text-spider-red" : 
              feature.color === "spider-blue" ? "text-spider-blue" : "text-black"
            )}>
              <div className="scale-[4]">{feature.icon}</div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className={cn(
                "w-12 h-12 mb-4 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                feature.color === "spider-red" ? "text-spider-red" : 
                feature.color === "spider-blue" ? "text-spider-blue" : "text-black"
              )}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bebas text-2xl md:text-3xl tracking-wide mb-1 text-black">
                  {feature.title}
                </h3>
                <p className="font-fredoka text-black/70 font-medium">
                  {feature.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
