"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { GlitchText } from "@/components/GlitchText";
import { HangingWebs } from "@/components/HangingWebs";

export default function LandingPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const handleCreateRoom = () => {
    setIsCreating(true);
    // Connect as anonymous or authenticated
    const providedUsername = user?.username || "Host_" + Math.floor(Math.random() * 1000);
    socket.auth = { username: providedUsername, userId: user?.id };
    socket.connect();
    socket.emit("create_room");
  };

  useEffect(() => {
    socket.on("room_created", (roomCode) => {
      router.push(`/join?code=${roomCode}`);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setIsCreating(false);
      alert("Failed to connect to the server. Please try again.");
    });

    return () => {
      socket.off("room_created");
      socket.off("connect_error");
    };
  }, [router]);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-x-hidden halftone-bg">
      {/* Auth Header */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="font-bebas text-xl text-spider-black bg-spider-white border-2 border-black px-4 py-2 hover:bg-spider-blue hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              {user.username} ▼
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 flex flex-col">
                <Link
                  href="/dashboard"
                  className="font-fredoka text-left px-4 py-2 text-spider-black hover:bg-spider-blue hover:text-white transition-colors border-b-2 border-black"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="font-fredoka text-left px-4 py-2 text-spider-black hover:bg-spider-red hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="font-bebas text-xl text-spider-black bg-spider-white border-2 border-black px-4 py-2 hover:bg-spider-blue hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              LOGIN
            </Link>
            <Link
              href="/signup"
              className="font-bebas text-xl text-white bg-spider-red border-2 border-black px-4 py-2 hover:bg-spider-black transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              SIGNUP
            </Link>
          </div>
        )}
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-spider-red opacity-10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-spider-blue opacity-10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <HangingWebs />
      </div>

      <div className="z-10 text-center max-w-4xl w-full mt-16">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col items-center"
        >
          <span className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-full overflow-hidden border-4 border-spider-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
            <Image
              src="/spider.png"
              alt="SpiderChat"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </span>
          <GlitchText
            text="SPIDERCHAT"
            textColorClass="text-spider-red"
            glitchVariants={[
              "SPIDER//CHAT", "SP1D3R_CHAT", "SPIDER-CHAT", "SPIDΞRCHAT",
              "S_P_I_D_E_R", "MULT1V3RSE_CHAT", "PETER_CHAT", "MILES_CHAT",
              "GWEN_CHAT", "VENOM_CHAT", "2099_CHAT", "🕸️_CHAT"
            ]}
            className="text-7xl md:text-9xl mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest"
          />
          <p className="font-fredoka text-xl md:text-3xl text-spider-white italic mb-12 transform -rotate-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            Enter the Multiverse of Conversations.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center px-4">
          {user ? (
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto"
            >
              <Link
                href="/dashboard"
                className="comic-button block w-full text-center py-4 px-12 bg-spider-red skew-x-[-6deg]"
              >
                ENTER DASHBOARD
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto"
              >
                <Link
                  href="/join"
                  className="comic-button block w-full text-center py-4 px-12 bg-spider-blue skew-x-[-6deg]"
                >
                  JOIN ROOM
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto"
              >
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className={`comic-button w-full py-4 px-12 flex items-center justify-center gap-2 skew-x-[-6deg] ${isCreating ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      WARPING...
                    </>
                  ) : (
                    "CREATE ROOM"
                  )}
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* How it Works Section */}
        <section className="mt-32 w-full">
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            <GlitchText text="HOW IT" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
            <GlitchText text="WORKS" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-spider-white text-spider-black p-6 comic-panel rotate-1">
              <div className="bg-spider-red text-white w-12 h-12 flex items-center justify-center font-bebas text-3xl mb-4 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform -rotate-3">1</div>
              <h3 className="font-bebas text-2xl mb-2 transform -skew-x-6 text-spider-red">JOIN OR CREATE</h3>
              <p className="font-fredoka">Start a conversation instantly. Create a new room or enter an existing code.</p>
            </div>
            <div className="bg-spider-white text-spider-black p-6 comic-panel -rotate-1">
              <div className="bg-spider-blue text-white w-12 h-12 flex items-center justify-center font-bebas text-3xl mb-4 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform rotate-3">2</div>
              <h3 className="font-bebas text-2xl mb-2 transform -skew-x-6 text-spider-blue">INVITE SQUAD</h3>
              <p className="font-fredoka">Share the room link or code with friends. Anyone can join instantly from any dimension.</p>
            </div>
            <div className="bg-spider-white text-spider-black p-6 comic-panel rotate-1">
              <div className="bg-spider-red text-white w-12 h-12 flex items-center justify-center font-bebas text-3xl mb-4 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform -rotate-3">3</div>
              <h3 className="font-bebas text-2xl mb-2 transform -skew-x-6 text-spider-red">CHAT REAL-TIME</h3>
              <p className="font-fredoka">Messages appear instantly across all participants. Smooth, fast, and anonymous.</p>
            </div>
          </div>
        </section>

        {/* Why SpiderChat Section */}
        <section className="mt-32 w-full">
          <div className="bg-spider-blue/20 p-8 rounded-3xl border-4 border-spider-blue/30 backdrop-blur-sm">
            <div className="flex justify-center flex-wrap gap-4 mb-12">
              <GlitchText text="WHY" textColorClass="text-spider-blue" className="text-5xl md:text-6xl" />
              <GlitchText text="SPIDERCHAT?" textColorClass="text-spider-white" className="text-5xl md:text-6xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "PRIVATE ROOMS", desc: "Create focused conversations for your team or friends." },
                { title: "INSTANT CHAT", desc: "No account required. Your time is valuable, don't waste it on signups." },
                { title: "LIGHTNING FAST", desc: "Built with WebSockets for ultra-low latency multiverse communication." },
                { title: "CROSS-DEVICE", desc: "Looks amazing on mobile, tablet, and desktop." }
              ].map((item, i) => (
                <div key={i} className="bg-spider-black/50 border-2 border-spider-blue p-4 flex gap-4 items-start hover:bg-spider-blue/10 transition-colors">
                  <div className="text-spider-blue mt-1">★</div>
                  <div className="text-left">
                    <h4 className="font-bebas text-xl text-spider-blue">{item.title}</h4>
                    <p className="text-sm font-fredoka">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multiverse Scenarios Section */}
        <section className="mt-32 mb-20 w-full text-left">
          <div className="flex justify-start flex-wrap gap-4 mb-12">
            <GlitchText text="CANON" textColorClass="text-spider-white" className="text-5xl md:text-6xl" />
            <GlitchText text="EVENTS" textColorClass="text-spider-red" className="text-5xl md:text-6xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Study Groups (Earth-1610)", icon: "📚", color: "bg-yellow-400" },
              { title: "Gaming (Earth-42)", icon: "🎮", color: "bg-purple-500" },
              { title: "Alchemax Events", icon: "🏢", color: "bg-green-500" },
              { title: "Spider-Society Comm", icon: "🕸️", color: "bg-blue-500" }
            ].map((useCase, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`${useCase.color} p-4 comic-panel border-black text-black`}
              >
                <div className="text-4xl mb-2">{useCase.icon}</div>
                <h4 className="font-bebas text-xl">{useCase.title}</h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Niche Footer with Links */}
        <footer className="mt-20 pb-12 text-center border-t-4 border-spider-blue/30 pt-12">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8 font-bebas text-xl text-spider-white/70">
            <Link href="/privacy-policy" className="hover:text-spider-red hover:underline transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              PRIVACY PROTOCOLS
            </Link>
            <Link href="/support" className="hover:text-spider-blue hover:underline transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              GUY IN THE CHAIR (SUPPORT)
            </Link>
            <Link href="/feedback" className="hover:text-[#39FF14] hover:underline transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              DAILY BUGLE TIPS (FEEDBACK)
            </Link>
          </div>

          {/* <a
            href="https://github.com/illuminatiAyush"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:scale-105 transition-transform"
          >
            <GlitchText text="BY @ILLUMINATIAYUSH // EARTH-1218" textColorClass="text-spider-white/50" className="text-lg md:text-xl" />
          </a> */}
        </footer>
      </div>
    </main>
  );
}
