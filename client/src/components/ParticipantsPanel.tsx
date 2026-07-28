"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users as UsersIcon, Crown, User, Ghost, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface Participant {
  id: string;
  username: string;
  isAuthenticated: boolean;
  isOwner: boolean;
  presence: 'connected' | 'reconnecting';
  joinedAt: number;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUsername: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isDarkMode?: boolean;
}

export default function ParticipantsPanel({ participants, currentUsername, isOpen, onClose, isMobile, isDarkMode }: ParticipantsPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedParticipants = useMemo(() => {
    // If on mobile or showAll is true, show everyone. Otherwise, limit to 8.
    if (isMobile || showAll) return participants;
    return participants.slice(0, 8);
  }, [participants, isMobile, showAll]);

  const hiddenCount = participants.length > 8 ? participants.length - 8 : 0;

  const PanelContent = () => (
    <div className={cn("flex flex-col h-full", isDarkMode ? "bg-[#141414] border-l-2 border-black" : "bg-spider-white")}>
      <div className={cn("p-3 border-b-2 border-black flex justify-between items-center", isDarkMode ? "bg-black text-spider-white" : "bg-spider-black text-spider-white")}>
        <h3 className="font-bebas text-lg md:text-xl tracking-wider flex items-center gap-2">
          <UsersIcon size={18} />
          MULTIVERSE ({participants.length})
        </h3>
        {isMobile && (
          <button 
            onClick={onClose}
            className="font-bebas text-sm bg-spider-red px-3 py-1 border-2 border-black hover:bg-white hover:text-spider-red transition-colors"
          >
            CLOSE
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence>
          {displayedParticipants.map((p) => {
            const isMe = p.username === currentUsername;
            return (
              <motion.div
                key={p.id || p.username}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "flex items-center gap-2 p-2 font-fredoka font-medium text-sm transition-colors border-2",
                  isMe 
                    ? (isDarkMode ? "bg-spider-blue/20 border-spider-blue text-spider-white" : "bg-spider-blue/10 border-spider-blue text-black")
                    : (isDarkMode ? "bg-[#222] border-transparent text-spider-white hover:bg-spider-black hover:border-black" : "bg-transparent border-transparent text-black hover:bg-black/5 hover:border-black/10")
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {/* Presence Indicator */}
                  <motion.div 
                    animate={{ 
                      scale: p.presence === 'connected' ? [1, 1.2, 1] : 1,
                      opacity: p.presence === 'reconnecting' ? 0.5 : 1
                    }}
                    transition={{ duration: 2, repeat: p.presence === 'connected' ? Infinity : 0, repeatType: "reverse" }}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 border border-black",
                      p.presence === 'connected' ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-gray-400"
                    )}
                  />
                  
                  <div className="flex flex-col min-w-0">
                    <span className="font-fredoka font-bold text-sm truncate flex items-center gap-1">
                      {p.username}
                      {isMe && <span className="text-[10px] text-spider-red uppercase tracking-wider font-bebas">(YOU)</span>}
                    </span>
                    
                    <span className={cn("font-bebas text-[11px] flex items-center gap-1 uppercase tracking-wider", isDarkMode ? "text-spider-white/60" : "text-spider-black/60")}>
                      {p.isOwner ? (
                        <><Crown size={10} className="text-yellow-500" /> 🕷 Creator</>
                      ) : p.isAuthenticated ? (
                        <><User size={10} /> 👤 Hero</>
                      ) : (
                        <><Ghost size={10} /> 👻 Guest</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Desktop Hover Card */}
                {!isMobile && (
                  <div className="absolute top-0 right-full mr-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    <div className="font-fredoka font-bold text-sm border-b border-black/10 pb-1 mb-1">
                      {p.username}
                    </div>
                    <div className="font-bebas text-xs flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        {p.isOwner ? "🕷 Creator" : p.isAuthenticated ? "👤 Hero" : "👻 Guest"}
                      </span>
                      <span className="text-black/50">
                        Joined {new Date(p.joinedAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isMobile && hiddenCount > 0 && !showAll && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll(true)}
            className={cn(
              "w-full p-2 mt-2 font-fredoka text-xs font-bold border-2 border-dashed flex items-center justify-center gap-1 transition-colors",
              isDarkMode ? "border-spider-white/30 text-spider-white/70 hover:bg-white/10 hover:border-spider-white/50" : "border-black/30 text-black/70 hover:bg-black/5 hover:border-black/50 hover:text-black"
            )}
          >
            + {hiddenCount} MORE HEROES
          </motion.button>
        )}
      </div>
    </div>
  );

  // Mobile rendering (Bottom Sheet / Drawer)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[70vh] bg-spider-white z-[100] border-t-4 border-black shadow-[0_-4px_0_rgba(0,0,0,0.2)] flex flex-col"
            >
              <PanelContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop rendering (Dropdown Panel)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full right-0 mt-2 w-64 max-h-[400px] bg-spider-white border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] z-50 flex flex-col overflow-hidden comic-panel"
        >
          <PanelContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
