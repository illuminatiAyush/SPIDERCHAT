"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { Message } from "@/app/room/[roomCode]/page";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: string;
  currentUsername: string; // fallback
  onReply: (message: Message) => void;
  isDarkMode?: boolean;
}

export default function ChatWindow({ messages, currentUserId, currentUsername, onReply, isDarkMode }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 halftone-bg-dark"
    >
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
          <div className="text-8xl mb-4 group-hover:animate-bounce transform rotate-12 transition-transform">⚡</div>
          <h3 className={cn("text-3xl font-bebas mb-2 uppercase", isDarkMode ? "text-spider-white" : "text-spider-black")}>Silence in the Multiverse</h3>
          <p className={cn("font-fredoka max-w-xs", isDarkMode ? "text-spider-white/70" : "text-spider-black/70")}>No signals detected from this dimension yet. Be the first to break the void!</p>
        </div>
      )}
      
      {messages.map((msg, index) => {
        // Use senderId if available, fallback to username (for older messages in DB before this change)
        const isOwn = (msg.senderId && currentUserId) ? msg.senderId === currentUserId : msg.username === currentUsername;
        
        return (
          <MessageBubble 
            key={msg.id || index} 
            message={msg} 
            isOwn={isOwn}
            onReply={() => onReply(msg)}
            isDarkMode={isDarkMode}
          />
        );
      })}
    </div>
  );
}
