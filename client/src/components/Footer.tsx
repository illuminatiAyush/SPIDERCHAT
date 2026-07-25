"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserCog, Newspaper, Shield, FileText, Github, Activity } from 'lucide-react';

const Footer = () => {
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const brandName = "SPIDERCHAT";

  // Web strand particles (simple floating effect)
  const particles = Array.from({ length: 20 });

  return (
    <footer className="relative w-full overflow-hidden min-h-screen flex flex-col justify-between bg-black text-white selection:bg-spider-red selection:text-white">

      {/* Cinematic Web Strand Separator */}
      <div className="absolute top-0 left-0 w-full h-[2px] z-[100]">
        {/* Soft Glow Layer */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: 'linear-gradient(to right, transparent, #1D4ED8 30%, #B91C1C 70%, transparent)',
            filter: 'blur(6px)'
          }} 
        />
        {/* Core Strand */}
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            background: 'linear-gradient(to right, transparent, #1D4ED8 30%, #B91C1C 70%, transparent)'
          }} 
        />
        {/* Animated Shimmer Highlight */}
        <motion.div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)',
            backgroundSize: '15% 100%',
            backgroundRepeat: 'no-repeat',
          }}
          animate={{ backgroundPosition: ['-20% 0', '120% 0'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* z-0: Spider-Verse wallpaper */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/footerimg.jpg"
          alt="Spider-Verse Cinematic Background"
          fill
          priority={false}
          className="object-cover scale-105"
          style={{
            opacity: 0.40,
            filter: 'brightness(0.60) contrast(1.1) saturate(1.1)'
          }}
        />
      </div>

      {/* z-10: black overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-black/40 to-[#050505]" />

      {/* z-20: red radial glow */}
      <motion.div
        className="absolute inset-0 z-20 opacity-40 mix-blend-screen pointer-events-none"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: 'radial-gradient(circle at 50% 100%, rgba(226, 54, 54, 0.25) 0%, transparent 60%)'
        }}
      />

      {/* z-30: particles */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Moving Halftone Texture (Merging into z-30 so we keep z-40 and z-50 for content) */}
      <motion.div
        className="absolute inset-0 z-30 opacity-20 pointer-events-none mix-blend-overlay"
        animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1.5px)',
          backgroundSize: '12px 12px'
        }}
      />

      {/* Content wrapper */}
      <div className="relative flex flex-col h-full w-full max-w-7xl mx-auto px-6 py-12 md:py-16 justify-between flex-grow">

        {/* z-50: footer links (Top Navigation) */}
        <div className="relative z-50 flex flex-col md:flex-row justify-between md:justify-around items-center gap-8 mb-16 md:mb-0 w-full mt-4">
          <Link href="/privacy-policy" className="group flex flex-col items-center gap-2">
            <motion.div whileHover={{ y: -4 }} className="flex items-center gap-2 text-spider-white/60 group-hover:text-spider-red transition-all duration-300">
              <span className="font-bebas text-xl md:text-2xl tracking-wider group-hover:underline decoration-2 underline-offset-4 decoration-spider-red group-hover:drop-shadow-[0_0_8px_rgba(226,54,54,0.5)] cursor-pointer">
                🛡 PRIVACY PROTOCOLS
              </span>
            </motion.div>
          </Link>

          <Link href="/support" className="group flex flex-col items-center gap-2">
            <motion.div whileHover={{ y: -4 }} className="flex items-center gap-2 text-spider-white/60 group-hover:text-spider-red transition-all duration-300">
              <span className="font-bebas text-xl md:text-2xl tracking-wider group-hover:underline decoration-2 underline-offset-4 decoration-spider-red group-hover:drop-shadow-[0_0_8px_rgba(226,54,54,0.5)] cursor-pointer">
                🕷 GUY IN THE CHAIR
              </span>
            </motion.div>
          </Link>

          <Link href="/feedback" className="group flex flex-col items-center gap-2">
            <motion.div whileHover={{ y: -4 }} className="flex items-center gap-2 text-spider-white/60 group-hover:text-spider-red transition-all duration-300">
              <span className="font-bebas text-xl md:text-2xl tracking-wider group-hover:underline decoration-2 underline-offset-4 decoration-spider-red group-hover:drop-shadow-[0_0_8px_rgba(226,54,54,0.5)] cursor-pointer">
                📰 DAILY BUGLE
              </span>
            </motion.div>
          </Link>
        </div>

        {/* z-40: SPIDERCHAT text */}
        <div className="relative z-40 flex flex-col items-center justify-center flex-grow py-12 md:py-0 w-full select-none">
          <div className="w-full flex justify-center items-center overflow-hidden relative h-[10rem] md:h-[18rem] lg:h-[24rem]">
            <div className="flex pointer-events-auto h-full items-center relative">

              {/* Ambient Atmosphere Glows (Behind the text) */}
              <motion.div
                className="absolute top-[20%] bottom-[20%] left-0 w-[55%] rounded-full pointer-events-none z-[-1]"
                style={{ backgroundColor: '#7A1010', filter: 'blur(35px)' }}
                animate={{ opacity: (hoveredLetter !== null && hoveredLetter < 6) ? 0.60 : 0.18 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute top-[20%] bottom-[20%] right-0 w-[45%] rounded-full pointer-events-none z-[-1]"
                style={{ backgroundColor: '#0A245A', filter: 'blur(35px)' }}
                animate={{ opacity: (hoveredLetter !== null && hoveredLetter >= 6) ? 0.60 : 0.18 }}
                transition={{ duration: 0.3 }}
              />

              <div
                className="flex font-bebas tracking-tighter uppercase cursor-default"
                style={{
                  fontSize: 'clamp(3.5rem, 16vw, 22rem)',
                  lineHeight: 0.85,
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
              >
                {brandName.split("").map((char, idx) => {
                  const isHovered = hoveredLetter === idx;
                  const isRed = idx < 6;

                  return (
                    <motion.div
                      key={idx}
                      className="relative flex"
                      onMouseEnter={() => setHoveredLetter(idx)}
                      onMouseLeave={() => setHoveredLetter(null)}
                    >
                      {/* Outer Glow Layer (Behind) */}
                      <motion.span
                        className="absolute inset-0 pointer-events-none select-none z-[-1]"
                        style={{ color: 'transparent' }}
                        animate={{
                          textShadow: isHovered
                            ? (isRed
                              ? '0 0 8px rgba(120,0,0,0.8), 0 0 20px rgba(120,0,0,0.6), 0 0 40px rgba(120,0,0,0.4), 0 0 80px rgba(120,0,0,0.3)'
                              : '0 0 8px rgba(18,52,120,0.8), 0 0 20px rgba(18,52,120,0.6), 0 0 40px rgba(18,52,120,0.4), 0 0 80px rgba(18,52,120,0.3)')
                            : '0 0 0px transparent'
                        }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        {char}
                      </motion.span>

                      {/* Metallic Silver Text Layer */}
                      <motion.span
                        className="pointer-events-none relative z-10"
                        animate={{
                          filter: isHovered
                            ? (isRed ? 'drop-shadow(0 0 12px rgba(120,0,0,.35))' : 'drop-shadow(0 0 12px rgba(18,52,120,.35))')
                            : 'drop-shadow(0 4px 12px rgba(0,0,0,.30))',
                          backgroundPosition: ['300% 0%, 0% 0%', '-100% 0%, 0% 0%']
                        }}
                        transition={{
                          filter: { duration: 0.22, ease: 'easeOut' },
                          backgroundPosition: { duration: 7, repeat: Infinity, ease: 'linear', delay: idx * 0.15 }
                        }}
                        style={{
                          backgroundImage: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%), linear-gradient(to bottom, #F7F7F7, #DCDCDC, #BDBDBD)',
                          backgroundSize: '200% 100%, 100% 100%',
                          backgroundRepeat: 'no-repeat, no-repeat',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent'
                        }}
                      >
                        {char}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-2 text-center"
          >
            <p className="font-fredoka text-lg md:text-2xl text-spider-white/60 italic drop-shadow-lg tracking-wide">
              "One Web. Infinite Conversations."
            </p>
          </motion.div>
        </div>

        {/* z-50: footer links (Bottom Bar) */}
        <div className="relative z-50 w-full mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">

          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <p className="font-fredoka text-xs md:text-sm text-spider-white/40 tracking-wider">
              © 2026 SpiderChat • Earth-616
            </p>
            <p className="font-fredoka text-[10px] md:text-xs text-spider-white/30 italic">
              "With Great Conversations Comes Great Responsibility."
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-bebas text-lg text-spider-white/40">
            <Link href="/terms" className="hover:text-spider-red hover:underline hover:-translate-y-1 decoration-2 underline-offset-4 decoration-spider-red transition-all duration-300 flex items-center gap-1 cursor-pointer group">
              <FileText size={14} className="group-hover:text-spider-red transition-colors" />
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-spider-red hover:underline hover:-translate-y-1 decoration-2 underline-offset-4 decoration-spider-red transition-all duration-300 flex items-center gap-1 cursor-pointer group">
              <Shield size={14} className="group-hover:text-spider-red transition-colors" />
              Security
            </Link>
            <a href="https://github.com/illuminatiAyush" target="_blank" rel="noopener noreferrer" className="hover:text-spider-red hover:underline hover:-translate-y-1 decoration-2 underline-offset-4 decoration-spider-red transition-all duration-300 flex items-center gap-1 cursor-pointer group">
              <Github size={14} className="group-hover:text-spider-red transition-colors" />
              GitHub
            </a>
            <Link href="/status" className="hover:text-spider-red hover:underline hover:-translate-y-1 decoration-2 underline-offset-4 decoration-spider-red transition-all duration-300 flex items-center gap-1 cursor-pointer group">
              <Activity size={14} className="group-hover:text-spider-red transition-colors" />
              Status
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
