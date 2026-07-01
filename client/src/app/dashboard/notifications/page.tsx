"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function NotificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends/requests");
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to accept request", error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await fetch("/api/friends/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to decline request", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full h-full">
      <h1 className="text-5xl font-bebas text-spider-white mb-8 transform -skew-x-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
        FRIEND REQUESTS
      </h1>

      {loading ? (
        <p className="font-bebas text-2xl text-spider-white">Loading signals...</p>
      ) : requests.length === 0 ? (
        <p className="font-bebas text-2xl text-spider-white">No pending requests right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={request.id}
              className="comic-panel p-4 bg-spider-white text-spider-black flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 bg-spider-blue text-white rounded-full flex items-center justify-center border-2 border-black font-bebas text-2xl">
                  {request.sender.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bebas text-2xl">@{request.sender.username}</p>
                  <p className="font-fredoka text-gray-600">Wants to connect</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="flex items-center gap-1 px-4 py-2 font-bebas text-xl bg-spider-red text-white border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-transform"
                >
                  <Check size={20} /> ACCEPT
                </button>
                <button
                  onClick={() => handleDecline(request.id)}
                  className="flex items-center gap-1 px-4 py-2 font-bebas text-xl bg-gray-200 text-spider-black border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-transform"
                >
                  <X size={20} /> DECLINE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
