"use client";

import React from "react";
import { motion } from "framer-motion";
import { Message } from "@/app/room/[roomCode]/page";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import { Reply } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: () => void;
  isDarkMode?: boolean;
}

const MessageBubble = ({ message, isOwn, onReply, isDarkMode }: MessageBubbleProps) => {
  const { addToast } = useToast();
  const handleDragEnd = (e: any, info: any) => {
    // If swiped left beyond threshold
    if (info.offset.x < -40) {
      onReply();
    }
  };

  const handleReplyClick = () => {
    if (!message.replyTo?.id) return;
    const originalEl = document.getElementById(`message-${message.replyTo.id}`);
    if (originalEl) {
      originalEl.scrollIntoView({ behavior: "smooth", block: "center" });
      originalEl.classList.add("animate-pulse", "ring-4", "ring-spider-red", "rounded-xl", "transition-all", "duration-300");
      setTimeout(() => {
        originalEl.classList.remove("animate-pulse", "ring-4", "ring-spider-red", "rounded-xl");
      }, 1000);
    } else {
      // Show toast if not loaded
      addToast({ type: 'error', title: 'Reply Unavailable', message: 'The original message could not be found.' });
    }
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2" id={message.id ? `message-${message.id}` : undefined}>
        <span className={cn(
          "px-3 py-1 text-xs font-bebas uppercase tracking-wider skew-x-12 border-2",
          isDarkMode ? "bg-[#141414] text-spider-white border-spider-black" : "bg-spider-black text-foreground border-spider-white"
        )}>
          {message.text}
        </span>
      </div>
    );
  }

  const isReplyDeleted = message.replyTo && (!message.replyTo.text && !message.replyTo.username);

  return (
    <motion.div
      id={message.id ? `message-${message.id}` : undefined}
      initial={{ scale: 0.8, opacity: 0, x: isOwn ? 20 : -20 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.2, right: 0 }}
      onDragEnd={handleDragEnd}
      className={cn(
        "flex flex-col max-w-[80%] group cursor-grab active:cursor-grabbing",
        isOwn ? "self-end items-end" : "self-start items-start"
      )}
    >
      <span className={cn("text-xs font-bebas mb-1 px-1", isDarkMode ? "text-spider-white/60" : "text-foreground/60")}>
        {isOwn ? "YOU" : message.username.toUpperCase()} • {message.timestamp}
      </span>
      
      <div className={cn(
        "relative p-3 border-4 border-black font-fredoka font-bold text-foreground group",
        isOwn 
          ? "bg-spider-red rounded-l-2xl rounded-tr-2xl shadow-[4px_4px_0_rgba(0,0,0,1)]" 
          : "bg-spider-blue rounded-r-2xl rounded-tl-2xl shadow-[-4px_4px_0_rgba(0,0,0,1)] text-white"
      )}>
        {/* Desktop Reply Button */}
        <button
          onClick={onReply}
          className={cn(
            "hidden md:flex absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center w-8 h-8 rounded-full bg-spider-black/10 hover:bg-spider-black hover:text-spider-red z-10",
            isOwn ? "right-full mr-2" : "left-full ml-2"
          )}
          title="Reply"
        >
          <Reply size={16} />
        </button>

        {/* Reply reference */}
        {message.replyTo && (
          <div 
            onClick={handleReplyClick}
            className={cn(
              "mb-2 px-3 py-2 rounded-md text-xs border-2 cursor-pointer transition-colors hover:opacity-80 active:scale-[0.98]",
              isOwn 
                ? "bg-black/20 border-black/40 text-foreground/90" 
                : "bg-black/20 border-white/30 text-white/90"
            )}
          >
            <span className="font-bebas text-[11px] uppercase block mb-1">
              ↩ Replying to {isReplyDeleted ? "Deleted Message" : message.replyTo.username}
            </span>
            <span className="line-clamp-2 font-fredoka font-normal text-[12px] opacity-90">
              {isReplyDeleted ? "This message is unavailable." : message.replyTo.text}
            </span>
          </div>
        )}

        {message.text}
        
        {/* Tail of the bubble */}
        <div className={cn(
          "absolute -bottom-1 w-4 h-4 border-b-4 border-black",
          isOwn 
            ? "right-2 bg-spider-red border-r-4 rotate-[15deg] translate-y-2" 
            : "left-2 bg-spider-blue border-l-4 -rotate-[15deg] translate-y-2"
        )} />
      </div>

      {/* Reply button — appears on hover */}
      <button
        onClick={onReply}
        className={cn(
          "mt-1 flex items-center gap-1 text-[10px] font-bebas uppercase tracking-wider",
          "text-foreground/40 hover:text-spider-red transition-colors",
          "opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100",
          "active:opacity-100"
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Reply to this message"
      >
        <Reply size={12} />
        Reply
      </button>
    </motion.div>
  );
}

export default React.memo(MessageBubble);
