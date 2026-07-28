"use client";

import { motion } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { cn } from "@/lib/utils";

const journeySteps = [
  { title: "CREATE ACCOUNT", desc: "Or jump in as a guest.", color: "spider-red" },
  { title: "JOIN DIMENSION", desc: "Enter a room code or link.", color: "spider-blue" },
  { title: "MEET HEROES", desc: "Find your squad.", color: "black" },
  { title: "REPLY", desc: "Threaded conversations.", color: "spider-red" },
  { title: "BECOME FRIENDS", desc: "Add them to your roster.", color: "spider-blue" },
  { title: "CONTINUE IN DMs", desc: "Take it to a private chat.", color: "black" },
  { title: "CREATE UNIVERSE", desc: "Host your own room.", color: "spider-red" },
];

export default function JourneyTimeline() {
  return (
    <section className="mt-32 w-full px-4 max-w-4xl mx-auto">
      <div className="flex justify-center flex-wrap gap-4 mb-20">
        <GlitchText text="YOUR" textColorClass="text-foreground" className="text-5xl md:text-6xl" />
        <GlitchText text="JOURNEY" textColorClass="text-spider-blue" className="text-5xl md:text-6xl" />
      </div>

      <div className="relative">
        {/* Animated Web Strand (Vertical Line) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/10 transform -translate-x-1/2 hidden md:block">
          <motion.div
            className="w-full bg-spider-blue origin-top"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>

        <div className="flex flex-col gap-12 relative z-10">
          {journeySteps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={step.title} className="flex flex-col md:flex-row items-center justify-between w-full">
                
                {/* Left Side */}
                <div className={cn("w-full md:w-5/12", isEven ? "md:text-right" : "md:order-3 md:text-left text-center")}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                    className={cn(
                      "bg-white border-4 border-black p-4 comic-shadow inline-block w-full sm:w-auto text-center md:text-left",
                      !isEven && "md:text-left"
                    )}
                  >
                    <h3 className={cn(
                      "font-bebas text-2xl mb-1",
                      step.color === "spider-red" ? "text-spider-red" : 
                      step.color === "spider-blue" ? "text-spider-blue" : "text-black"
                    )}>
                      {step.title}
                    </h3>
                    <p className="font-fredoka text-black/70 font-medium text-sm">
                      {step.desc}
                    </p>
                  </motion.div>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex w-2/12 justify-center relative md:order-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.3, delay: i * 0.2 + 0.2, type: "spring" }}
                    className={cn(
                      "w-6 h-6 rounded-full border-4 border-black z-20 shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                      step.color === "spider-red" ? "bg-spider-red" : 
                      step.color === "spider-blue" ? "bg-spider-blue" : "bg-white"
                    )}
                  />
                </div>

                {/* Empty Side for layout */}
                <div className={cn("hidden md:block w-5/12", isEven ? "md:order-3" : "md:order-1")} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
