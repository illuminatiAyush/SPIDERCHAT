"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, LogOut, Check, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAuth } from "@/components/AuthProvider";
import ParticipantsPanel, { Participant } from "./ParticipantsPanel";
import { cn } from "@/lib/utils";

interface RoomHeaderProps {
  roomCode: string;
  userCount: number;
  isOwner?: boolean;
  onOpenAdmin?: () => void;
  participants: Participant[];
  currentUsername: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function RoomHeader({ roomCode, userCount, isOwner, onOpenAdmin, participants, currentUsername, isDarkMode, onToggleDarkMode }: RoomHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/join?code=${roomCode}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = () => {
    socket.disconnect();
    sessionStorage.removeItem("spiderchat_username");
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const handleHomeClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header className={cn("flex flex-col md:flex-row items-center justify-between p-3 md:p-4 comic-panel z-20 gap-3 md:gap-0", isDarkMode ? "bg-[#1B1B1D] border-b-4 border-[#232326] text-white" : "bg-spider-white")}>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
          aria-label="SpiderChat home"
        >
          <span className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded-full overflow-hidden border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <Image
              src="/spider.png"
              alt="SpiderChat"
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="font-bebas text-2xl md:text-4xl text-spider-red drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            SPIDERCHAT
          </span>
        </button>

        <div className="flex-1 md:flex-none flex items-center gap-2 bg-spider-black text-spider-white px-3 py-1 skew-x-[-10deg] border-2 border-spider-red">
          <span className="font-bebas text-sm md:text-lg tracking-wider">ROOM: {roomCode}</span>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto">
        <div
          className="relative flex items-center gap-2 font-fredoka font-bold text-[10px] md:text-sm cursor-pointer hover:opacity-80 transition-opacity"
          onMouseEnter={() => !isMobile && setShowParticipants(true)}
          onMouseLeave={() => !isMobile && setShowParticipants(false)}
          onClick={() => isMobile && setShowParticipants(!showParticipants)}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spider-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-spider-blue"></span>
          </span>
          <span className={cn("uppercase tracking-tighter", isDarkMode ? "text-spider-white" : "text-spider-black")}>
            <span className="text-spider-red text-lg md:text-xl font-bebas">{userCount}</span> <span className="font-bebas">HEROES ACTIVE</span>
          </span>

          <ParticipantsPanel
            participants={participants}
            currentUsername={currentUsername}
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
            isMobile={isMobile}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleDarkMode}
              className={cn(
                "p-2 md:p-3 border-2 transition-colors flex items-center justify-center",
                isDarkMode 
                  ? "bg-[#232326] text-spider-white shadow-[2px_2px_0_0_rgba(255,255,255,1)] border-[#333333]" 
                  : "bg-spider-white text-spider-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 border-black"
              )}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          )}

          {isOwner && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-black border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-spider-black hover:text-yellow-500 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span className="font-bebas text-xs md:text-sm uppercase tracking-widest">
                ADMIN CONTROLS
              </span>
            </button>
          )}
          <button
            onClick={copyRoomLink}
            className={`flex items-center gap-2 px-3 py-1.5 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${isCopied ? "bg-green-500 text-white" : "bg-spider-blue text-white hover:bg-spider-black"
              }`}
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={18} />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy size={18} />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="font-bebas text-xs md:text-sm uppercase tracking-widest">
              {isCopied ? "COPIED!" : "INVITE"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-spider-red text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-spider-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <LogOut size={18} />
            <span className="font-bebas text-xs md:text-sm uppercase tracking-widest">LEAVE</span>
          </button>
          {/* <a
            href="https://github.com/illuminatiAyush"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline font-bebas text-spider-black/60 hover:text-spider-red text-xs ml-2 transition-colors"
          >
            @illuminatiAyush
          </a> */}
        </div>
      </div>
    </header>
  );
}
