"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Plus } from "lucide-react";

type Participant = {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

type ConversationType = {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCounts?: Record<string, number>;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conv: ConversationType): Participant | null => {
    if (!user) return null;
    return conv.participants.find((p) => p._id !== user.id) || null;
  };

  const getUnreadCount = (conv: ConversationType): number => {
    if (!user || !conv.unreadCounts) return 0;
    const counts = conv.unreadCounts as any;
    // Handle both Map serialization and plain object
    if (counts instanceof Map) return counts.get(user.id) || 0;
    return counts[user.id] || 0;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const name = (other.displayName || other.username).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <div className="w-full lg:w-96 bg-spider-white border-r-4 border-black flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b-4 border-black bg-spider-blue">
          <div className="flex items-center justify-between">
            <h2 className="font-bebas text-3xl text-white tracking-wider">
              DIRECT MESSAGES
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push("/dashboard/friends")}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 hover:bg-white/30 transition-colors"
              title="Start new conversation"
            >
              <Plus size={20} className="text-white" />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b-2 border-black/10 bg-white">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-spider-black/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 font-fredoka text-sm text-spider-black border-2 border-black/20 rounded-xl focus:outline-none focus:border-spider-blue transition-colors bg-white"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <p className="font-bebas text-2xl text-spider-black/50 animate-pulse">
                LOADING CHATS...
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center mt-10">
              <div className="w-20 h-20 bg-spider-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={36} className="text-spider-blue/40" />
              </div>
              <p className="font-bebas text-2xl text-spider-black/40 mb-2">
                NO CONVERSATIONS YET
              </p>
              <p className="font-fredoka text-sm text-spider-black/40">
                Head to Friends to start chatting!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map((conv, i) => {
                const other = getOtherParticipant(conv);
                const unread = getUnreadCount(conv);
                if (!other) return null;

                return (
                  <motion.button
                    key={conv._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() =>
                      router.push(`/dashboard/messages/${conv._id}`)
                    }
                    className="w-full flex items-center gap-3 p-4 hover:bg-spider-blue/5 transition-colors border-b border-black/5 text-left group"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={other.avatar || "/spider.png"}
                        alt={other.username}
                        className="w-12 h-12 rounded-full border-2 border-black bg-spider-red object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          other.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`font-bebas text-lg text-spider-black leading-none truncate ${
                            unread > 0 ? "text-spider-black" : ""
                          }`}
                        >
                          {other.displayName || other.username}
                        </h3>
                        <span className="font-fredoka text-xs text-spider-black/40 shrink-0 ml-2">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-fredoka text-sm truncate ${
                            unread > 0
                              ? "text-spider-black font-semibold"
                              : "text-spider-black/50"
                          }`}
                        >
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {unread > 0 && (
                          <span className="ml-2 shrink-0 bg-spider-red text-white text-xs font-bebas min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border border-black/20">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Empty State (right side, hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-spider-black/50 p-10 rounded-3xl border-4 border-spider-blue/30 backdrop-blur-sm max-w-md text-center"
        >
          <div className="w-24 h-24 bg-spider-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💬</span>
          </div>
          <h2 className="font-bebas text-4xl text-spider-white mb-4">
            SELECT A CONVERSATION
          </h2>
          <p className="font-fredoka text-spider-white/70 text-lg">
            Choose a chat from the sidebar to start messaging across the
            multiverse!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
