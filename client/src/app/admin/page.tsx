"use client";

import { useState, useEffect } from "react";
import { GlitchText } from "@/components/GlitchText";
import { ShieldAlert, Users, Activity, MessageSquare, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // default to true while checking session
  const [error, setError] = useState("");
  
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"users" | "feedback" | "messages">("users");

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/stats', { method: 'GET' });
        const json = await res.json();
        if (res.ok && json.success) {
          setIsAuthenticated(true);
          setData(json.data);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);
  
  // Message Moderation state
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageType, setMessageType] = useState<"all" | "room" | "dm">("all");
  // Real-time tracking
  const [liveUserIds, setLiveUserIds] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const newSocket = io(SOCKET_URL, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_admin_dashboard');
      });

      newSocket.on('admin_live_users', (activeIds: string[]) => {
        setLiveUserIds(activeIds);
      });

      newSocket.on("moderation:new", (modLog: any) => {
        setMessages((prev) => {
          if (messageType !== "all" && modLog.source.toLowerCase() !== messageType) return prev;
          if (searchQuery) return prev;
          return [modLog, ...prev].slice(0, 50);
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, messageType, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authenticate and get cookie
      const authRes = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const authJson = await authRes.json();
      
      if (authRes.ok && authJson.success) {
        // 2. Fetch data (will use the cookie)
        const statsRes = await fetch('/api/admin/stats', { method: 'GET' });
        const statsJson = await statsRes.json();
        if (statsRes.ok && statsJson.success) {
          setIsAuthenticated(true);
          setData(statsJson.data);
        } else {
          setError("FAILED TO FETCH DATA");
        }
      } else {
        setError(authJson.error || "ACCESS DENIED");
      }
    } catch (err) {
      setError("SYSTEM FAILURE");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, search: searchQuery, type: messageType })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessages(json.data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && isAuthenticated) {
      loadMessages();
    }
  }, [activeTab, isAuthenticated, messageType]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 halftone-bg">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="comic-panel bg-yellow-400 text-spider-black p-8 max-w-md w-full border-4 border-spider-red"
        >
          <div className="text-center mb-8">
            <ShieldAlert className="w-16 h-16 mx-auto text-spider-red mb-4" />
            <h1 className="font-bebas text-4xl text-spider-red">ALCHEMAX SECURE TERMINAL</h1>
            <p className="font-fredoka text-sm text-spider-black/60">AUTHORIZED PERSONNEL ONLY</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-bebas text-xl mb-2">OPERATIVE ID</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 font-mono text-black border-4 border-spider-red bg-spider-white focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                autoFocus
              />
            </div>
            <div>
              <label className="block font-bebas text-xl mb-2">ACCESS CODE</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 font-mono text-black border-4 border-spider-red bg-spider-white focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            {error && <p className="font-bebas text-spider-red text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="comic-button bg-spider-red text-white w-full py-4 text-xl hover:bg-spider-blue"
            >
              {loading ? "AUTHENTICATING..." : "BYPASS MAINFRAME"}
            </button>
          </form>
          <div className="mt-6 text-center">
             <Link href="/" className="font-bebas text-spider-black/60 hover:text-white">← RETURN TO BASE</Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-spider-black text-white p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b-4 border-spider-blue pb-4">
          <div className="flex items-center gap-4">
            <Terminal className="w-10 h-10 text-spider-blue" />
            <GlitchText text="ADMIN HQ" textColorClass="text-spider-blue" className="text-4xl md:text-5xl" />
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="font-bebas text-xl px-4 py-2 border-2 border-spider-red text-spider-red hover:bg-spider-red hover:text-white transition-colors"
          >
            LOGOUT TERMINAL
          </button>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-spider-white text-spider-black p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bebas text-2xl">TOTAL USERS</h3>
              <Users className="w-6 h-6 text-spider-blue" />
            </div>
            <p className="font-bebas text-5xl">{data?.stats.totalUsers}</p>
          </div>
          <div className="bg-spider-blue text-white p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bebas text-2xl">LIVE DIMENSIONS</h3>
              <Activity className="w-6 h-6" />
            </div>
            <p className="font-bebas text-5xl">{liveUserIds.length}</p>
          </div>
          <div className="bg-[#39FF14] text-spider-black p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bebas text-2xl">BUGLE TIPS</h3>
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-bebas text-5xl">{data?.stats.totalFeedback}</p>
          </div>
          <div className="bg-spider-red text-white p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bebas text-2xl">TOTAL VISITS</h3>
              <Terminal className="w-6 h-6" />
            </div>
            <p className="font-bebas text-5xl">{data?.stats.totalVisits}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('users')}
            className={`font-bebas text-2xl px-6 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${activeTab === 'users' ? 'bg-spider-blue text-white' : 'bg-spider-white text-spider-black hover:bg-gray-200'}`}
          >
            USER REGISTRY
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`font-bebas text-2xl px-6 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${activeTab === 'feedback' ? 'bg-[#39FF14] text-black' : 'bg-spider-white text-spider-black hover:bg-gray-200'}`}
          >
            BUGLE INBOX
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`font-bebas text-2xl px-6 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${activeTab === 'messages' ? 'bg-spider-red text-white' : 'bg-spider-white text-spider-black hover:bg-gray-200'}`}
          >
            MODERATION LOGS
          </button>
        </div>

        {/* CONTENT PANELS */}
        <div className="bg-black border-4 border-spider-white/20 p-4 min-h-[500px]">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-fredoka text-spider-black">
                <thead>
                  <tr className="border-b-2 border-spider-white/20 text-spider-blue font-bebas text-xl">
                    <th className="p-4">STATUS</th>
                    <th className="p-4">USERNAME</th>
                    <th className="p-4">JOINED (EARTH TIME)</th>
                    <th className="p-4">VISIT COUNT</th>
                    <th className="p-4">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((user: any) => (
                    <tr key={user.id} className="border-b border-spider-white/10 hover:bg-spider-white/5 transition-colors">
                      <td className="p-4">
                        {liveUserIds.includes(user.id) ? (
                          <span className="inline-flex items-center gap-2 text-[#39FF14] font-bold">
                            <div className="w-3 h-3 rounded-full bg-[#39FF14] animate-pulse" /> LIVE
                          </span>
                        ) : (
                          <span className="text-gray-500">OFFLINE</span>
                        )}
                      </td>
                      <td className="p-4 font-bold">{user.username}</td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                      <td className="p-4">{user.visitCount}</td>
                      <td className="p-4 font-mono text-sm text-gray-500">{user.id}</td>
                    </tr>
                  ))}
                  {data?.users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">NO USERS IN THE MULTIVERSE YET</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="grid gap-4">
              {data?.feedbacks.map((fb: any) => (
                <div key={fb.id} className="bg-spider-white/5 border-2 border-spider-white/20 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bebas text-2xl text-[#39FF14]">{fb.alias}</h4>
                      <span className="text-spider-black/50 text-sm">{fb.universe || "Unknown Universe"}</span>
                    </div>
                    <span className="text-sm font-mono text-spider-black/50">{new Date(fb.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</span>
                  </div>
                  <p className="font-fredoka text-lg whitespace-pre-wrap">{fb.content}</p>
                </div>
              ))}
              {data?.feedbacks.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-bebas text-2xl">
                  NO TIPS FROM THE BUGLE TODAY
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="SEARCH LOGS..." 
                  className="px-4 py-3 font-mono text-black border-4 border-spider-red bg-spider-white focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)] w-full max-w-md"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadMessages()}
                />
                <select 
                  className="px-4 py-3 font-bebas text-xl text-black border-4 border-spider-red bg-spider-white focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  value={messageType}
                  onChange={e => setMessageType(e.target.value as any)}
                >
                  <option value="all">ALL COMMUNICATIONS</option>
                  <option value="room">PUBLIC ROOMS</option>
                  <option value="dm">DIRECT MESSAGES</option>
                </select>
                <button 
                  onClick={loadMessages}
                  className="comic-button bg-spider-red text-white px-8 py-3 font-bebas text-2xl hover:bg-spider-blue"
                >
                  SCAN
                </button>
              </div>

              {messagesLoading ? (
                <div className="p-8 text-center text-spider-red font-bebas text-2xl animate-pulse">DECRYPTING DATA...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-fredoka text-spider-black">
                    <thead>
                      <tr className="border-b-2 border-spider-white/20 text-spider-red font-bebas text-xl">
                        <th className="p-4">SOURCE</th>
                        <th className="p-4">SENDER</th>
                        <th className="p-4">DESTINATION (ROOM/DM)</th>
                        <th className="p-4">TIMESTAMP</th>
                        <th className="p-4">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg: any) => (
                        <tr key={msg.logId} className={`border-b border-spider-white/10 hover:bg-spider-white/5 transition-colors ${msg.status === 'DELETED' ? 'opacity-50' : ''}`}>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${msg.source === 'ROOM' ? 'bg-spider-blue text-white' : 'bg-[#39FF14] text-black'}`}>
                              {msg.source}
                            </span>
                          </td>
                          <td className="p-4 font-bold">
                            {msg.senderName}
                            {msg.isGuest && <span className="ml-2 text-xs font-mono text-spider-black/50">(GUEST)</span>}
                          </td>
                          <td className="p-4 font-mono text-sm text-gray-400">
                            {msg.source === 'ROOM' ? msg.roomId : `DM: ${msg.conversationId}`}
                          </td>
                          <td className="p-4">{new Date(msg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</td>
                          <td className="p-4 text-xs font-mono">{msg.status}</td>
                        </tr>
                      ))}
                      {messages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">NO LOGS FOUND</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
