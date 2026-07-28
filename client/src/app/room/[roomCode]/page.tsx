"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import ChatWindow from "@/components/ChatWindow";
import MessageInput from "@/components/MessageInput";
import UserList, { RoomUser } from "@/components/UserList";
import RoomHeader from "@/components/RoomHeader";
import RoomAdminModal from "@/components/RoomAdminModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

export type Message = {
  id?: string;
  senderId?: string;
  username: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system';
  replyTo?: {
    id: string;
    username: string;
    text: string;
  };
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.roomCode as string) || "";
  const { user, loading } = useAuth();
  
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { addToast } = useToast();
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Room State
  const [roomTitle, setRoomTitle] = useState(roomCode);
  const [isLocked, setIsLocked] = useState(false);
  const [slowMode, setSlowMode] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedDark = localStorage.getItem("chatDarkMode");
    if (savedDark === "true") {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("chatDarkMode", next.toString());
      return next;
    });
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const timer = setTimeout(() => setCountdown(null), 1000); // fade out
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!mounted || !roomCode || loading) return;

    let storedUsername: string | undefined | null = user?.username;
    if (!storedUsername) {
      storedUsername = sessionStorage.getItem("spiderchat_username");
    }

    if (!storedUsername) {
      router.push(`/join?code=${roomCode}`);
      return;
    }
    
    setUsername(storedUsername);

    // Socket events
    if (!socket.connected || (socket.auth as any)?.username !== storedUsername) {
      if (socket.connected) socket.disconnect();
      
      let guestId = sessionStorage.getItem("spiderchat_guest_id");
      if (!guestId) {
        guestId = `anon_${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem("spiderchat_guest_id", guestId);
      }
      
      socket.auth = { username: storedUsername, userId: user?.id, guestId };
      socket.connect();
    }

    const onConnect = () => {
      console.log("[Socket] Connected to server:", socket.id);
      socket.emit("join_room", { roomCode, username: storedUsername });
    };

    socket.on("connect", onConnect);
    
    // If already connected, join room
    if (socket.connected) {
      onConnect();
    }

    socket.on("user_list", (userList: any[]) => {
      setUsers(userList || []);
    });
    
    socket.on("room_participants", (list: any[]) => {
      setUsers(list || []);
    });

    const sortParticipants = (list: any[]) => {
      return [...list].sort((a, b) => {
        if (a.isOwner && !b.isOwner) return -1;
        if (!a.isOwner && b.isOwner) return 1;
        if (a.isAuthenticated && !b.isAuthenticated) return -1;
        if (!a.isAuthenticated && b.isAuthenticated) return 1;
        return a.username.localeCompare(b.username);
      });
    };

    socket.on("participant_joined", (user: any) => {
      setUsers(prev => {
        if (prev.find(u => u.username === user.username)) return prev;
        return sortParticipants([...prev, user]);
      });
    });

    socket.on("participant_updated", (user: any) => {
      setUsers(prev => sortParticipants(prev.map(u => u.username === user.username ? { ...u, ...user } : u)));
    });

    socket.on("participant_left", (data: { username: string }) => {
      setUsers(prev => prev.filter(u => u.username !== data.username));
    });

    socket.on("message_history", (history: Message[]) => {
      setMessages(prev => {
        const merged = [...(history || []), ...prev];
        const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());
        return unique.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      });
    });

    socket.on("receive_message", (message: Message) => {
      if (message) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("display_typing", (data) => {
      if (!data) return;
      const { username: tUser, isTyping } = data;
      if (isTyping && tUser !== storedUsername) {
        setTypingUser(tUser);
      } else {
        setTypingUser(null);
      }
    });

    socket.on("error_message", (error: string) => {
      console.error("[Socket] Error received:", error);
      const lower = error.toLowerCase();
      
      // Parse countdown
      if (lower.includes("starts in") || lower.includes("countdown") || lower.includes("timer set")) {
        // Find if there's a number in the string
        const match = error.match(/\d+/);
        const seconds = match ? parseInt(match[0], 10) : 3;
        setCountdown(seconds);
        return;
      }
      
      addToast({ type: 'error', title: 'System Alert', message: error });
      
      // Only redirect on fatal connection issues (e.g. invalid room, banned)
      if (lower.includes("locked") || lower.includes("banned") || lower.includes("not found") || lower.includes("invalid")) {
        router.push("/join");
      }
    });
    
    // Admin Events
    socket.on("kicked", (reason: string) => {
      addToast({ type: 'error', title: 'SYSTEM OVERRIDE', message: reason });
      router.push("/join");
    });

    socket.on("room_deleted", (reason: string) => {
      addToast({ type: 'error', title: 'DIMENSION COLLAPSE', message: reason });
      router.push("/");
    });

    socket.on("room_cleared", () => {
      setMessages([]);
    });

    socket.on("room_updated", (data: any) => {
      if (data.title !== undefined) setRoomTitle(data.title);
      if (data.locked !== undefined) setIsLocked(data.locked);
      if (data.slowMode !== undefined) setSlowMode(data.slowMode);
    });

    setIsJoined(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("user_list");
      socket.off("room_participants");
      socket.off("participant_joined");
      socket.off("participant_updated");
      socket.off("participant_left");
      socket.off("message_history");
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("error_message");
      socket.off("kicked");
      socket.off("room_deleted");
      socket.off("room_cleared");
      socket.off("room_updated");
    };
  }, [mounted, roomCode, router, user, loading]);

  if (!mounted || !isJoined || !username || !roomCode) {
    return (
      <div className="h-screen flex flex-col gap-6 items-center justify-center bg-spider-black halftone-bg">
        <LoadingAnimation size={240} text="WARPING TO DIMENSION..." />
      </div>
    );
  }

  const currentUser = users.find(u => u.username === username) || users.find(u => u.socketId === socket.id);
  const isOwner = currentUser?.isOwner || false;
  const isMuted = currentUser?.isMuted || false;

  return (
    <main className="h-[calc(100dvh-29px)] md:h-[calc(100dvh-33px)] flex flex-col bg-spider-black halftone-bg overflow-hidden p-0 md:p-4 gap-0 md:gap-4 relative">
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-spider-black/90 backdrop-blur-sm"
          >
            <div className="comic-panel bg-spider-white p-8 md:p-12 text-center max-w-md w-full mx-4 border-4 border-black shadow-[8px_8px_0_0_rgba(226,54,54,1)]">
              <div className="mb-4 text-spider-red text-6xl flex justify-center animate-pulse">
                🕷
              </div>
              <h2 className="text-3xl md:text-4xl font-bebas text-spider-black mb-6 transform -skew-x-6">
                CONNECTING TO THE MULTIVERSE...
              </h2>
              
              <div className="w-full h-1 bg-black/10 my-6">
                <motion.div 
                  className="h-full bg-spider-red"
                  initial={{ width: "10%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>

              <div className="space-y-2">
                <p className="font-bebas text-xl text-spider-black/60 tracking-wider">
                  CHAT BEGINS IN
                </p>
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-7xl font-bebas text-spider-red drop-shadow-[2px_2px_0_rgba(0,0,0,1)]"
                >
                  {countdown > 0 ? countdown : "GO!"}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoomHeader 
        roomCode={roomTitle} 
        userCount={users.length} 
        isOwner={isOwner}
        onOpenAdmin={() => setShowAdminModal(true)}
        participants={users as any}
        currentUsername={username}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <div className={cn("flex-1 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden relative", isDarkMode ? "bg-[#0B0B0B]" : "")}>
        <div className={cn("flex-1 flex flex-col overflow-hidden comic-panel-mobile md:comic-panel", isDarkMode ? "bg-[#141414] text-spider-white border-spider-black" : "bg-spider-white")}>
          <ChatWindow 
            messages={messages} 
            currentUserId={currentUser?.id}
            currentUsername={username}
            onReply={(msg) => setReplyingTo(msg)}
            isDarkMode={isDarkMode}
          />
          
          <AnimatePresence>
            {typingUser && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-4 py-1 text-xs md:text-sm font-fredoka text-black italic bg-spider-white/90 border-t border-black/10"
              >
                {typingUser} is glitching... (typing)
              </motion.div>
            )}
          </AnimatePresence>
          
          {!currentUser ? (
            <div className={cn("p-4 border-t-4 border-black text-center font-bebas text-2xl flex items-center justify-center gap-2", isDarkMode ? "bg-black/50 text-spider-white/50" : "bg-gray-200 text-spider-black/50")}>
              CONNECTING TO THE MULTIVERSE...
            </div>
          ) : isMuted ? (
            <div className={cn("p-4 border-t-4 border-black text-center font-bebas text-2xl flex items-center justify-center gap-2 text-spider-red", isDarkMode ? "bg-black/50" : "bg-gray-200")}>
              YOU HAVE BEEN MUTED BY THE ROOM OWNER.
            </div>
          ) : (
            <MessageInput 
              roomCode={roomCode} 
              username={username}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
        
        <div className={cn("hidden md:block w-72 comic-panel overflow-hidden", isDarkMode ? "bg-[#141414] border-spider-black" : "bg-spider-white")}>
          <UserList users={users} roomCode={roomCode} isDarkMode={isDarkMode} />
        </div>
      </div>

      {showAdminModal && (
        <RoomAdminModal 
          roomCode={roomCode}
          isLocked={isLocked}
          slowMode={slowMode}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </main>
  );
}
