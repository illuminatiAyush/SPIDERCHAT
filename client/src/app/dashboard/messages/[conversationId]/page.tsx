"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import {
  ArrowLeft,
  Send,
  Loader2,
  ChevronUp,
  Reply,
  Check,
  CheckCheck,
  Smile,
} from "lucide-react";

type MessageType = {
  _id: string;
  senderId: { _id: string; username: string; displayName?: string; avatar?: string } | string;
  content: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "seen";
  replyTo?: MessageType | null;
  reactions: Array<{ emoji: string; userId: string }>;
  createdAt: string;
  editedAt?: string;
};

type Participant = {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
};

const REACTION_EMOJIS = ["🔥", "❤️", "😂", "👍", "😎", "🕷️"];

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { user, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<Participant | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation details & messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchConversation = async () => {
      try {
        // Get conversation details
        const convRes = await fetch("/api/conversations");
        const convData = await convRes.json();
        const conv = (convData.conversations || []).find(
          (c: any) => c._id === conversationId
        );
        if (conv) {
          const other = conv.participants.find(
            (p: any) => p._id !== user.id
          );
          setPartner(other || null);
        }

        // Get messages
        const msgRes = await fetch(
          `/api/messages/${conversationId}`
        );
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
        setHasMore(false); // Simplified for Prisma demo

        // Mark as read
        await fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
        socket.emit("dm_seen", { conversationId });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();

    const handleLiveUsers = (e: CustomEvent<string[]>) => {
      const activeIds = new Set(e.detail);
      setPartner((prev) => {
        if (!prev) return prev;
        const isOnline = activeIds.has(prev._id) || activeIds.has((prev as any).id);
        return { ...prev, isOnline };
      });
    };

    window.addEventListener("spiderchat_live_users_update", handleLiveUsers as EventListener);

    return () => {
      window.removeEventListener("spiderchat_live_users_update", handleLiveUsers as EventListener);
    };
  }, [conversationId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  // Socket connection for real-time
  useEffect(() => {
    if (!user || !conversationId) return;

    if (!socket.connected) {
      socket.auth = { username: user.username, userId: user.id, token };
      socket.connect();
    }

    // Join conversation room
    socket.emit("join_dm", { conversationId });

    const handleDmReceive = (message: MessageType) => {
      setMessages((prev) => [...prev, message]);
      // Auto mark as read
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      socket.emit("dm_seen", { conversationId });
    };

    const handleDmTyping = ({ userId, isTyping: typing, conversationId: cid }: any) => {
      if (cid === conversationId && userId !== user.id) {
        setIsTyping(typing);
      }
    };

    const handleDmSeen = ({ conversationId: cid }: any) => {
      if (cid === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = typeof m.senderId === "string" ? m.senderId : m.senderId._id;
            if (senderId === user.id) {
              return { ...m, status: "seen" };
            }
            return m;
          })
        );
      }
    };

    const handleDmReaction = ({ messageId, emoji, userId: reactorId, conversationId: cid }: any) => {
      if (cid === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m._id === messageId) {
              const existing = m.reactions.find(
                (r) => r.emoji === emoji && r.userId === reactorId
              );
              if (existing) {
                return {
                  ...m,
                  reactions: m.reactions.filter(
                    (r) => !(r.emoji === emoji && r.userId === reactorId)
                  ),
                };
              }
              return {
                ...m,
                reactions: [...m.reactions, { emoji, userId: reactorId }],
              };
            }
            return m;
          })
        );
      }
    };

    socket.on("dm_receive", handleDmReceive);
    socket.on("dm_typing", handleDmTyping);
    socket.on("dm_seen", handleDmSeen);
    socket.on("dm_reaction", handleDmReaction);

    return () => {
      socket.off("dm_receive", handleDmReceive);
      socket.off("dm_typing", handleDmTyping);
      socket.off("dm_seen", handleDmSeen);
      socket.off("dm_reaction", handleDmReaction);
      socket.emit("leave_dm", { conversationId });
    };
  }, [user, token, conversationId]);

  // Load more messages
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/messages/${conversationId}`
      );
      const data = await res.json();
      setHasMore(false);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const optimisticMsg: MessageType = {
      _id: `temp_${Date.now()}`,
      senderId: { _id: user!.id, username: user!.username, displayName: user!.displayName, avatar: user!.avatar },
      content,
      type: "text",
      status: "sent",
      replyTo: replyingTo,
      reactions: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingTo(null);

    try {
      // Save to Prisma API first
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      
      // Update optimistic message with real ID
      if (data.message) {
        setMessages((prev) => 
          prev.map((m) => m._id === optimisticMsg._id ? { ...m, _id: data.message._id } : m)
        );
      }

      // Broadcast via socket for real-time delivery
      socket.emit("dm_send", {
        conversationId,
        content,
        type: "text",
        replyTo: replyingTo?._id || null,
        messageId: data.message?._id
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Typing indicator
  const handleTyping = () => {
    socket.emit("dm_typing", {
      conversationId,
      userId: user?.id,
      isTyping: true,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("dm_typing", {
        conversationId,
        userId: user?.id,
        isTyping: false,
      });
    }, 2000);
  };

  // Add reaction
  const addReaction = (messageId: string, emoji: string) => {
    socket.emit("dm_reaction", { conversationId, messageId, emoji });
    setShowReactions(null);
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id === messageId) {
          const existing = m.reactions.find(
            (r) => r.emoji === emoji && r.userId === user?.id
          );
          if (existing) {
            return {
              ...m,
              reactions: m.reactions.filter(
                (r) => !(r.emoji === emoji && r.userId === user?.id)
              ),
            };
          }
          return {
            ...m,
            reactions: [...m.reactions, { emoji, userId: user!.id }],
          };
        }
        return m;
      })
    );
  };

  const getSenderId = (msg: MessageType): string => {
    return typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
  };

  const getSenderName = (msg: MessageType): string => {
    if (typeof msg.senderId === "string") return "Unknown";
    return msg.senderId.displayName || msg.senderId.username;
  };

  const getSenderAvatar = (msg: MessageType): string => {
    if (typeof msg.senderId === "string") return "/spider.png";
    return msg.senderId.avatar || "/spider.png";
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Group reactions
  const groupReactions = (reactions: Array<{ emoji: string; userId: string }>) => {
    const groups: Record<string, string[]> = {};
    for (const r of reactions) {
      if (!groups[r.emoji]) groups[r.emoji] = [];
      groups[r.emoji].push(r.userId);
    }
    return groups;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-bebas text-4xl text-spider-white animate-pulse">
          LOADING CONVERSATION...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="shrink-0 p-4 bg-spider-white border-b-4 border-black flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/dashboard/messages")}
          className="lg:hidden w-10 h-10 bg-spider-black text-white rounded-full flex items-center justify-center border-2 border-black"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {partner && (
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={partner.avatar || "/spider.png"}
                alt={partner.username}
                className="w-11 h-11 rounded-full border-2 border-black bg-spider-red object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  partner.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <h2 className="font-bebas text-2xl text-spider-black leading-none">
                {partner.displayName || partner.username}
              </h2>
              <p className="font-fredoka text-xs text-spider-black/50">
                {partner.isOnline
                  ? "🟢 Online"
                  : `Last seen ${formatLastSeen(partner.lastSeen)}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1"
      >
        {/* Load More */}
        {hasMore && (
          <div className="text-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              disabled={loadingMore}
              className="font-bebas text-lg text-spider-blue hover:text-spider-red transition-colors flex items-center gap-2 mx-auto px-4 py-2 border-2 border-spider-blue/30 rounded-xl hover:border-spider-red/30"
            >
              {loadingMore ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ChevronUp size={18} />
              )}
              {loadingMore ? "LOADING..." : "LOAD EARLIER MESSAGES"}
            </motion.button>
          </div>
        )}

        {/* Message Bubbles */}
        <AnimatePresence>
          {messages.map((msg, i) => {
            const isMine = getSenderId(msg) === user?.id;
            const showAvatar =
              i === 0 ||
              getSenderId(messages[i - 1]) !== getSenderId(msg);
            const reactions = groupReactions(msg.reactions || []);

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                  showAvatar ? "mt-4" : "mt-0.5"
                } group relative`}
              >
                {/* Other's Avatar */}
                {!isMine && showAvatar && (
                  <img
                    src={getSenderAvatar(msg)}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-black bg-spider-red object-cover mr-2 mt-1 shrink-0"
                  />
                )}
                {!isMine && !showAvatar && (
                  <div className="w-8 mr-2 shrink-0" />
                )}

                <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Sender name */}
                  {!isMine && showAvatar && (
                    <span className="font-bebas text-xs text-spider-white/60 ml-1 mb-1">
                      {getSenderName(msg)}
                    </span>
                  )}

                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div
                      className={`text-xs px-3 py-1.5 mb-0.5 rounded-t-lg border-l-4 ${
                        isMine
                          ? "bg-spider-blue/30 border-spider-blue/60 text-white/70"
                          : "bg-spider-white/10 border-spider-red/60 text-spider-white/60"
                      }`}
                    >
                      <span className="font-bebas">
                        {typeof msg.replyTo.senderId === "string"
                          ? ""
                          : (msg.replyTo.senderId as any)?.displayName || (msg.replyTo.senderId as any)?.username || ""}
                      </span>
                      <p className="truncate font-fredoka">{msg.replyTo.content}</p>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-spider-blue text-white rounded-br-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        : "bg-spider-white text-spider-black rounded-bl-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    }`}
                  >
                    {/* Image message */}
                    {msg.type === "image" ? (
                      <img
                        src={msg.content}
                        alt="Shared image"
                        className="max-w-full rounded-lg max-h-60 object-contain"
                      />
                    ) : (
                      <p className="font-fredoka text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    )}

                    {/* Timestamp & Status */}
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-fredoka ${
                          isMine ? "text-white/50" : "text-spider-black/40"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {msg.editedAt && (
                        <span
                          className={`text-[10px] italic ${
                            isMine ? "text-white/40" : "text-spider-black/30"
                          }`}
                        >
                          (edited)
                        </span>
                      )}
                      {isMine && (
                        <span className="ml-0.5">
                          {msg.status === "seen" ? (
                            <CheckCheck size={12} className="text-green-300" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck size={12} className="text-white/50" />
                          ) : (
                            <Check size={12} className="text-white/40" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${
                        isMine ? "-left-16" : "-right-16"
                      }`}
                    >
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="w-7 h-7 bg-spider-black/70 text-white rounded-full flex items-center justify-center hover:bg-spider-blue transition-colors"
                        title="Reply"
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        onClick={() =>
                          setShowReactions(
                            showReactions === msg._id ? null : msg._id
                          )
                        }
                        className="w-7 h-7 bg-spider-black/70 text-white rounded-full flex items-center justify-center hover:bg-spider-red transition-colors"
                        title="React"
                      >
                        <Smile size={14} />
                      </button>
                    </div>

                    {/* Reaction picker */}
                    {showReactions === msg._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute ${
                          isMine ? "right-0" : "left-0"
                        } -top-10 bg-spider-black border-2 border-spider-blue/50 rounded-full px-2 py-1 flex gap-1 z-10 shadow-lg`}
                      >
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg._id, emoji)}
                            className="text-lg hover:scale-125 transition-transform px-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Reactions display */}
                  {Object.keys(reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 ml-1">
                      {Object.entries(reactions).map(([emoji, users]) => (
                        <span
                          key={emoji}
                          className="bg-spider-black/60 text-white text-xs px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-0.5"
                        >
                          {emoji}{" "}
                          <span className="font-fredoka text-[10px]">
                            {users.length}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 mt-2"
            >
              {/* Partner's Avatar */}
              <img
                src={partner?.avatar || "/spider.png"}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-black bg-spider-red object-cover mr-2 shrink-0"
              />
              <div className="bg-spider-white text-spider-black px-4 py-2.5 rounded-2xl rounded-bl-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-spider-black/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-spider-black/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-spider-black/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="shrink-0 px-4 py-2 bg-spider-blue/10 border-t-2 border-spider-blue/30 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Reply size={16} className="text-spider-blue shrink-0" />
            <div className="min-w-0">
              <p className="font-bebas text-xs text-spider-blue">
                Replying to {getSenderName(replyingTo)}
              </p>
              <p className="font-fredoka text-xs text-spider-white/60 truncate">
                {replyingTo.content}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-spider-white/40 hover:text-white text-xl ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="shrink-0 p-4 bg-spider-white border-t-4 border-black">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 font-fredoka text-spider-black border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-spider-blue bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-spider-blue text-white rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-spider-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
