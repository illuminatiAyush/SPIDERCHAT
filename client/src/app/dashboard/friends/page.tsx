"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
    
    const handleLiveUsers = (e: CustomEvent<string[]>) => {
      const activeIds = new Set(e.detail);
      setOnlineUsers(activeIds);
      setFriends(prev => prev.map(f => ({
        ...f,
        isOnline: activeIds.has(f.id) || activeIds.has(f._id)
      })));
    };

    window.addEventListener('spiderchat_live_users_update', handleLiveUsers as EventListener);
    return () => window.removeEventListener('spiderchat_live_users_update', handleLiveUsers as EventListener);
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Failed to fetch friends", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (friendId: string) => {
    // Route to the new Dashboard Chat System for 1-on-1 DMs
    router.push(`/dashboard/messages/${friendId}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full">
      <h1 className="text-4xl md:text-5xl font-bebas text-spider-white mb-6 md:mb-8 transform -skew-x-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
        YOUR MULTIVERSE SQUAD
      </h1>

      {loading ? (
        <p className="font-bebas text-2xl text-spider-white">Loading connections...</p>
      ) : friends.length === 0 ? (
        <p className="font-bebas text-2xl text-spider-white">You have no allies yet. Go explore the multiverse!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {friends.map((friend) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={friend.id}
              className="comic-panel p-4 bg-spider-white text-spider-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 shrink-0 bg-spider-red text-white rounded-full flex items-center justify-center border-2 border-black font-bebas text-2xl overflow-hidden">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                    ) : (
                      friend.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      friend.isOnline || onlineUsers.has(friend.id) || onlineUsers.has(friend._id) ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-bebas text-2xl">@{friend.username}</p>
                  <p className="font-fredoka text-gray-600">{friend.displayName || "Traveler"}</p>
                </div>
              </div>
              
              <button
                onClick={() => openChat(friend.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 font-bebas text-xl border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform bg-spider-blue text-white hover:bg-spider-black hover:-translate-y-1 active:translate-y-0 active:shadow-none"
              >
                <MessageSquare size={20} /> OPEN CHAT
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
