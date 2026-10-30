"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { useAuth } from "@/components/AuthProvider";
import { LoadingAnimation } from "@/components/LoadingAnimation";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [anonName, setAnonName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setRoomCode(code);
    }
  }, [searchParams]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = user?.username?.trim() || anonName.trim();
    const trimmedRoom = roomCode.trim();
    if (!trimmedUsername || !trimmedRoom) {
      setError("Provide an alias and a room code, Avenger!");
      return;
    }

    let guestId = sessionStorage.getItem("spiderchat_guest_id");
    if (!guestId) {
      guestId = `anon_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem("spiderchat_guest_id", guestId);
    }
    
    socket.auth = { username: trimmedUsername, userId: user?.id, guestId };
    sessionStorage.setItem("spiderchat_username", trimmedUsername);
    router.push(`/room/${trimmedRoom.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 halftone-bg">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-spider-white p-8 comic-panel"
      >
        <h1 className="text-5xl font-bebas text-spider-black mb-6 text-center transform -rotate-1 skew-x-[-6deg] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
          MULTIVERSE <span className="text-spider-red">ENTRY</span>
        </h1>

        <form onSubmit={handleJoin} className="space-y-6">
          {loading ? (
            <div className="mb-4 animate-pulse opacity-70">
              <span className="block font-bebas text-spider-black text-2xl mb-1 transform -skew-x-6">
                AVENGER: <span className="text-spider-black/50">CONSULTING JARVIS...</span>
              </span>
            </div>
          ) : user ? (
            <div className="mb-4">
              <span className="block font-bebas text-spider-black text-2xl mb-1 transform -skew-x-6">
                AVENGER: <span className="text-spider-red">{user.username}</span>
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block font-bebas text-spider-black text-2xl mb-1 transform -skew-x-6">
                YOUR ALIAS
              </label>
              <input
                type="text"
                value={anonName}
                onChange={(e) => setAnonName(e.target.value)}
                placeholder="Enter a temporary name..."
                className="w-full px-4 py-3 border-4 border-black font-fredoka focus:outline-none focus:ring-0 text-spider-black bg-white"
              />
            </div>
          )}

          <div>
            <label className="block font-bebas text-spider-black text-2xl mb-1 transform -skew-x-6">
              ROOM CODE / KEY
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Any secret key..."
              className="w-full px-4 py-3 border-4 border-black font-fredoka focus:outline-none focus:ring-0 uppercase text-spider-black bg-white"
            />
            <p className="mt-1 text-[10px] font-fredoka text-spider-black/60 uppercase">
              Tip: Entering a new code creates that dimension instantly!
            </p>
          </div>

          {error && (
            <p className="text-spider-red font-bold text-center italic">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, rotate: -1 }}
            type="submit"
            className="comic-button w-full py-4 text-2xl skew-x-[-6deg]"
          >
            ENTER MULTIVERSE
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-spider-black underline font-bold hover:text-spider-red transition-colors"
          >
            ← BACK TO SAFETY
          </button>
        </div>
      </motion.div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative flex items-center justify-center p-4 halftone-bg">
        <div className="max-w-md w-full bg-spider-white p-8 comic-panel flex flex-col items-center">
          <h1 className="text-5xl font-bebas text-spider-black mb-6 text-center transform -rotate-1 skew-x-[-6deg] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            MULTIVERSE <span className="text-spider-red">ENTRY</span>
          </h1>
          <LoadingAnimation size={240} text="LOADING DIMENSION..." />
        </div>
      </main>
    }>
      <JoinForm />
    </Suspense>
  );
}
