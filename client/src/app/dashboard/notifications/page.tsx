"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function NotificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();

    const handleNewNotification = () => {
      fetchRequests();
    };

    window.addEventListener("spiderchat_new_notification", handleNewNotification);

    return () => {
      window.removeEventListener("spiderchat_new_notification", handleNewNotification);
    };
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


  const handleRequest = async (id: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch(`/api/friends/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full">
      <h1 className="text-4xl md:text-5xl font-bebas text-spider-white mb-6 md:mb-8 transform -skew-x-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
        DIMENSIONAL ALERTS
      </h1>

      {loading ? (
        <p className="font-bebas text-2xl text-spider-white">Loading signals...</p>
      ) : requests.length === 0 ? (
        <p className="font-bebas text-2xl text-spider-white">No pending requests right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={req.id}
              className="comic-panel p-4 bg-spider-white text-spider-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 shrink-0 bg-spider-blue text-white rounded-full flex items-center justify-center border-2 border-black font-bebas text-2xl">
                  {req.sender.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bebas text-2xl">@{req.sender.username}</p>
                  <p className="font-fredoka text-gray-600">Wants to connect</p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleRequest(req.id, 'accept')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 font-bebas text-xl border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform bg-green-500 text-white hover:bg-green-600 hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                >
                  <Check size={20} /> ACCEPT
                </button>
                <button
                  onClick={() => handleRequest(req.id, 'decline')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 font-bebas text-xl border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform bg-spider-red text-white hover:bg-spider-black hover:-translate-y-1 active:translate-y-0 active:shadow-none"
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
