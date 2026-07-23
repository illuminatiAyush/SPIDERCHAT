"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// CONFIGURATION FLAG: Set to false to easily disable the banner across the entire site
export const SHOW_ANNOUNCEMENT_BANNER = true;

const BANNER_LOCAL_STORAGE_KEY = "spiderchat_banner_dismissed_v1";

export function AnnouncementBanner() {
  if (!SHOW_ANNOUNCEMENT_BANNER) {
    return null;
  }

  // The text to display. We duplicate it to ensure a seamless marquee loop.
  const bannerText = (
    <span className="mx-4">
      SpiderChat is currently in <strong className="text-spider-red font-black">Pilot v1</strong>. We&apos;re actively building new features and refining the experience every week. Thank you for being an early adopter, stay tuned for exciting updates!
    </span>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-50 w-full overflow-hidden bg-spider-black border-b border-spider-blue/30 shadow-[0_0_10px_rgba(80,97,226,0.2)] text-spider-white text-xs md:text-sm font-fredoka flex items-center"
      >
        <div className="flex-1 overflow-hidden flex items-center h-7 md:h-8">
          <div className="animate-marquee flex whitespace-nowrap min-w-max cursor-default">
            {/* We render the text multiple times to ensure a smooth continuous loop */}
            {bannerText}
            {bannerText}
            {bannerText}
            {bannerText}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
