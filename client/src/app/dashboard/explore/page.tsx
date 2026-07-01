"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import { socket } from "@/lib/socket";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/explore/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to search users", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const sendFriendRequest = async (userId: string) => {
    if (sentRequests[userId]) return;
    
    // Optimistically set to true to prevent double clicks
    setSentRequests((prev) => ({ ...prev, [userId]: true }));
    
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      
      if (res.ok) {
        socket.emit("send_notification", {
          receiverId: userId,
          type: "friend_request",
          message: "Someone sent you a friend request!"
        });
      } else {
        // Revert on failure
        setSentRequests((prev) => ({ ...prev, [userId]: false }));
      }
    } catch (error) {
      console.error("Failed to send request", error);
      setSentRequests((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full">
      <h1 className="text-4xl md:text-5xl font-bebas text-spider-white mb-6 md:mb-8 transform -skew-x-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
        EXPLORE THE MULTIVERSE
      </h1>

      <div className="relative mb-8 comic-panel p-2 bg-spider-white flex items-center">
        <Search className="text-spider-black ml-2 shrink-0" size={24} />
        <input
          type="text"
          placeholder="Search for other travelers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent p-3 font-fredoka text-spider-black text-xl focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-4">
        {loading && <p className="font-bebas text-2xl text-spider-white">Searching...</p>}
        {!loading && query && users.length === 0 && (
          <p className="font-bebas text-2xl text-spider-white">No travelers found.</p>
        )}
        
        {users.map((user) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={user.id}
            className="comic-panel p-4 bg-spider-white text-spider-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 shrink-0 bg-spider-red text-white rounded-full flex items-center justify-center border-2 border-black font-bebas text-2xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bebas text-2xl">@{user.username}</p>
                <p className="font-fredoka text-gray-600">{user.displayName || "Traveler"}</p>
              </div>
            </div>
            
            <button
              onClick={() => sendFriendRequest(user.id)}
              disabled={sentRequests[user.id]}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 font-bebas text-xl border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform ${
                sentRequests[user.id] 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-spider-blue text-white hover:bg-spider-black hover:-translate-y-1 active:translate-y-0 active:shadow-none"
              }`}
            >
              <UserPlus size={20} />
              {sentRequests[user.id] ? "REQUEST SENT" : "ADD FRIEND"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
