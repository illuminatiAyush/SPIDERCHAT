"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, UserPlus, MessageSquare, Bell, ArrowRight } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    friendsCount: 0,
    pendingCount: 0,
    conversationsCount: 0,
    unreadNotifications: 0,
  });
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch both friends and requests concurrently
      const [friendsRes, reqRes] = await Promise.all([
        fetch("/api/friends/list"),
        fetch("/api/friends/requests")
      ]);
      
      const friendsData = await friendsRes.json();
      const reqData = await reqRes.json();

      const friends = friendsData.friends || [];
      const pending = reqData.requests || [];
      const conversations: any[] = [];
      const notifications: any[] = [];

      setStats({
        friendsCount: friends.length,
        pendingCount: pending.length,
        conversationsCount: conversations.length,
        unreadNotifications: pending.length, // Map pending requests to alerts
      });

      setRecentConversations(conversations.slice(0, 5));
      setOnlineFriends(friends.filter((f: any) => f.isOnline));
    } catch (err) {
      console.error(err);
    }
  };

  const startDM = async (userId: string) => {
    if (!user) return;
    const roomId = [user.id, userId].sort().join("_");
    router.push(`/room/${roomId}`);
  };

  const statCards = [
    {
      label: "FRIENDS",
      value: stats.friendsCount,
      icon: Users,
      color: "text-spider-blue",
      href: "/dashboard/friends",
      rotation: -1,
    },
    {
      label: "PENDING",
      value: stats.pendingCount,
      icon: UserPlus,
      color: "text-spider-red",
      href: "/dashboard/friends",
      rotation: 1,
    },
    {
      label: "CHATS",
      value: stats.conversationsCount,
      icon: MessageSquare,
      color: "text-spider-blue",
      href: "/dashboard/messages",
      rotation: -1,
    },
    {
      label: "ALERTS",
      value: stats.unreadNotifications,
      icon: Bell,
      color: "text-yellow-500",
      href: "/dashboard/notifications",
      rotation: 1,
    },
  ];

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-7xl font-bebas text-spider-red mb-2 transform -rotate-1 skew-x-[-6deg] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] md:drop-shadow-[3px_3px_0_rgba(0,0,0,1)] break-words">
          WELCOME BACK, {user?.displayName?.toUpperCase() || user?.username?.toUpperCase()}!
        </h1>
        <p className="font-fredoka text-lg md:text-xl text-spider-white/70 italic">
          Your personal multiverse command center.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.8, rotate: card.rotation * 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, rotate: card.rotation }}
            onClick={() => router.push(card.href)}
            className="bg-spider-white p-5 comic-panel border-4 border-black cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bebas text-xl md:text-2xl text-spider-black">
                {card.label}
              </h3>
              <card.icon size={28} className={card.color} />
            </div>
            <div className="flex items-end justify-between">
              <p className="font-bebas text-4xl md:text-5xl text-spider-black">
                {card.value}
              </p>
              <ArrowRight
                size={18}
                className="text-spider-black/30 group-hover:text-spider-red group-hover:translate-x-1 transition-all"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-spider-black/50 p-6 rounded-3xl border-4 border-spider-blue/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bebas text-spider-blue transform -rotate-1 skew-x-[-6deg] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              RECENT CHATS
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/dashboard/messages")}
              className="font-bebas text-sm text-spider-blue hover:text-spider-red transition-colors"
            >
              VIEW ALL →
            </motion.button>
          </div>
          <div className="flex flex-col gap-3">
            {recentConversations.length === 0 ? (
              <p className="italic text-spider-white/50 font-fredoka">
                No conversations yet. Start chatting with your friends!
              </p>
            ) : (
              recentConversations.map((conv: any) => {
                const other = conv.participants?.find(
                  (p: any) => p._id !== user?.id
                );
                if (!other) return null;
                return (
                  <motion.button
                    key={conv._id}
                    whileHover={{ x: 5 }}
                    onClick={() =>
                      router.push(`/dashboard/messages/${conv._id}`)
                    }
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="relative">
                      <img
                        src={other.avatar || "/spider.png"}
                        className="w-10 h-10 rounded-full border-2 border-black bg-spider-red object-cover"
                        alt=""
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-spider-black ${
                          other.isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bebas text-lg text-spider-white leading-none truncate">
                        {other.displayName || other.username}
                      </h4>
                      <p className="font-fredoka text-xs text-spider-white/40 truncate">
                        {conv.lastMessage || "Start chatting!"}
                      </p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.section>

        {/* Online Friends */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-spider-black/50 p-6 rounded-3xl border-4 border-spider-red/30 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bebas text-spider-red transform rotate-1 skew-x-[-6deg] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              ONLINE SQUAD
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push("/dashboard/friends")}
              className="font-bebas text-sm text-spider-red hover:text-spider-blue transition-colors"
            >
              ALL FRIENDS →
            </motion.button>
          </div>
          <div className="flex flex-col gap-3">
            {onlineFriends.length === 0 ? (
              <p className="italic text-spider-white/50 font-fredoka">
                No friends online right now. Check back later!
              </p>
            ) : (
              onlineFriends.map((friend: any) => (
                <motion.button
                  key={friend._id}
                  whileHover={{ x: 5 }}
                  onClick={() => startDM(friend._id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar || "/spider.png"}
                      className="w-10 h-10 rounded-full border-2 border-black bg-spider-red object-cover"
                      alt=""
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-spider-black bg-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bebas text-lg text-spider-white leading-none truncate">
                      {friend.displayName || friend.username}
                    </h4>
                    <p className="font-fredoka text-xs text-green-400">
                      🟢 Online now
                    </p>
                  </div>
                  <MessageSquare size={18} className="text-spider-white/30" />
                </motion.button>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
