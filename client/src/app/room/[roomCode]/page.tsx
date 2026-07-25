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

export type Message = {
  username: string;
  text: string;
  timestamp: string;
  type: 'user' | 'system';
  replyTo?: {
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
  
  // Room State
  const [roomTitle, setRoomTitle] = useState(roomCode);
  const [isLocked, setIsLocked] = useState(false);
  const [slowMode, setSlowMode] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!socket.connected) {
      socket.auth = { username: storedUsername, userId: user?.id };
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

    socket.on("user_list", (userList: RoomUser[]) => {
      setUsers(userList || []);
    });

    socket.on("message_history", (history: Message[]) => {
      setMessages(history || []);
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
      alert(error);
      router.push("/join");
    });
    
    // Admin Events
    socket.on("kicked", (reason: string) => {
      alert(`[SYSTEM OVERRIDE]: ${reason}`);
      router.push("/join");
    });

    socket.on("room_deleted", (reason: string) => {
      alert(`[DIMENSION COLLAPSE]: ${reason}`);
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

  const currentUser = users.find(u => u.socketId === socket.id);
  const isOwner = currentUser?.isOwner || false;
  const isMuted = currentUser?.isMuted || false;

  return (
    <main className="h-[calc(100dvh-29px)] md:h-[calc(100dvh-33px)] flex flex-col bg-spider-black halftone-bg overflow-hidden p-0 md:p-4 gap-0 md:gap-4">
      <RoomHeader 
        roomCode={roomTitle} 
        userCount={users.length} 
        isOwner={isOwner}
        onOpenAdmin={() => setShowAdminModal(true)}
      />
      
      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden bg-spider-white comic-panel-mobile md:comic-panel">
          <ChatWindow 
            messages={messages} 
            currentUsername={username}
            onReply={(msg) => setReplyingTo(msg)}
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
          
          {isMuted ? (
            <div className="p-4 bg-gray-200 border-t-4 border-black text-center font-bebas text-2xl text-spider-red flex items-center justify-center gap-2">
              YOU HAVE BEEN MUTED BY THE ROOM OWNER.
            </div>
          ) : (
            <MessageInput 
              roomCode={roomCode} 
              username={username}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          )}
        </div>
        
        <div className="hidden md:block w-72 bg-spider-white comic-panel">
          <UserList users={users} roomCode={roomCode} />
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
