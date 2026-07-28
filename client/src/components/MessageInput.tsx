"use client";

import { useState, useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/app/room/[roomCode]/page";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  roomCode: string;
  username: string;
  replyingTo: Message | null;
  onCancelReply: () => void;
  isDarkMode?: boolean;
}

export default function MessageInput({ roomCode, username, replyingTo, onCancelReply, isDarkMode }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset to auto to calculate scrollHeight
      const scrollHeight = textareaRef.current.scrollHeight;
      // Min height is around 48px, Max height 180px
      textareaRef.current.style.height = `${Math.max(48, Math.min(scrollHeight, 180))}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = window.innerWidth <= 768;
    if (e.key === 'Enter') {
      if (isMobile) {
        // Mobile: Enter creates new line, do nothing to prevent default
        return;
      }
      
      // Desktop: Enter sends, Shift+Enter creates new line
      if (!e.shiftKey) {
        e.preventDefault();
        handleSend(e as unknown as React.FormEvent);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload: { roomCode: string; text: string; username: string; replyTo?: { id: string; senderName: string; preview: string } } = {
      roomCode,
      text,
      username,
    };

    if (replyingTo && replyingTo.id) {
      payload.replyTo = {
        id: replyingTo.id,
        senderName: replyingTo.username,
        preview: replyingTo.text.length > 60 ? replyingTo.text.substring(0, 60) + "..." : replyingTo.text,
      };
      onCancelReply();
    }

    socket.emit("send_message", payload);
    setText("");
    
    // Stop typing indicator on send
    socket.emit("typing", { roomCode, username, isTyping: false });
    setIsTyping(false);

    // Re-focus input after send to prevent mobile keyboard dismissal
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  useEffect(() => {
    if (text.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing", { roomCode, username, isTyping: true });
      }
      
      // Clear typing indicator after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", { roomCode, username, isTyping: false });
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit("typing", { roomCode, username, isTyping: false });
    }
  }, [text, roomCode, username]);

  // Auto-focus input when replying to a message
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  return (
    <div className="p-3 md:p-4 border-t-4 border-black bg-spider-white">
      {/* Reply preview banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center gap-2 px-3 py-2 bg-spider-black/5 border-l-4 border-spider-red rounded-r-md overflow-hidden"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bebas text-spider-red uppercase block">
                Replying to {replyingTo.username}
              </span>
              <span className="text-xs font-fredoka text-spider-black/70 truncate block">
                {replyingTo.text}
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-spider-red/10 text-spider-black/50 hover:text-spider-red transition-colors"
              aria-label="Cancel reply"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSend} className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Message..."}
          className={cn(
            "flex-1 px-4 py-3 md:py-2 border-4 font-fredoka focus:outline-none focus:ring-0 text-base md:text-sm resize-none overflow-y-auto min-h-[48px] max-h-[180px]",
            isDarkMode ? "bg-[#141414] text-spider-white border-[#141414]" : "bg-white text-spider-black border-black"
          )}
          autoComplete="off"
          rows={1}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="bg-spider-red text-white px-4 py-2 border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center min-w-[50px]"
        >
          <Send size={24} />
        </motion.button>
      </form>
    </div>
  );
}
