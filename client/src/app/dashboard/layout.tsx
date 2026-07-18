"use client";

import { useAuth } from "@/components/AuthProvider";
import { GlitchText } from "@/components/GlitchText";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Bell, 
  Compass, 
  User as UserIcon, 
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import GlobalSocketListener from "@/components/GlobalSocketListener";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasNotifications, setHasNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/messages")) {
      setHasUnreadMessages(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    const checkAlerts = async () => {
      try {
        const res = await fetch("/api/friends/requests");
        const data = await res.json();
        if (data.requests && data.requests.length > 0) {
          setHasNotifications(true);
        } else {
          setHasNotifications(false);
        }
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };
    checkAlerts();
    
    const handleNewNotification = () => setHasNotifications(true);
    window.addEventListener("spiderchat_new_notification", handleNewNotification);
    
    const handleNewMessage = () => setHasUnreadMessages(true);
    window.addEventListener("spiderchat_new_message", handleNewMessage);
    
    // Check every 30s as a simple polling fallback
    const interval = setInterval(checkAlerts, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("spiderchat_new_notification", handleNewNotification);
      window.removeEventListener("spiderchat_new_message", handleNewMessage);
    };
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spider-black halftone-bg text-spider-white font-bebas text-4xl">
        LOADING DASHBOARD...
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Users, label: "Friends", href: "/dashboard/friends" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: Compass, label: "Explore", href: "/dashboard/explore" },
    { icon: UserIcon, label: "Profile", href: "/dashboard/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-spider-black halftone-bg overflow-hidden text-spider-white">
      {/* Left Sidebar */}
      <nav className="w-20 md:w-64 bg-spider-white border-r-4 border-black flex flex-col justify-between shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 border-b-4 border-black flex items-center justify-center md:justify-start md:px-4 bg-spider-red overflow-hidden relative">
            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-black rounded-full overflow-hidden shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] bg-spider-black">
              <img src="/spider.png" alt="Logo" className="w-full h-full object-cover p-1" />
            </div>
            <span className="hidden md:block ml-3 text-2xl lg:text-3xl font-bebas text-white transform -skew-x-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-wide">
              SPIDERCHAT
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-2 md:px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-colors relative ${
                      isActive 
                        ? 'bg-spider-blue text-white border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                        : 'bg-white text-spider-black border-transparent hover:border-black'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <item.icon size={24} />
                      {((item.label === 'Notifications' && hasNotifications) || (item.label === 'Messages' && hasUnreadMessages)) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-spider-red rounded-full border border-black animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></span>
                      )}
                      {((item.label === 'Notifications' && hasNotifications) || (item.label === 'Messages' && hasUnreadMessages)) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-spider-red rounded-full border border-black"></span>
                      )}
                    </div>
                    <span className="hidden md:block font-bebas text-xl tracking-wide">
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Area / Logout */}
          <div className="p-2 md:p-4 border-t-4 border-black bg-white flex flex-col gap-3">
            <div className="flex items-center justify-center md:justify-start gap-3 md:px-2">
              <div className="w-10 h-10 shrink-0 bg-spider-blue text-white rounded-full flex items-center justify-center border-2 border-black font-bebas text-xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block overflow-hidden">
                <p className="font-bebas text-spider-black text-lg truncate leading-tight">
                  @{user.username}
                </p>
                <p className="font-fredoka text-xs text-gray-500 truncate">
                  {user.displayName || "Multiverse Traveler"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="w-full flex items-center justify-center md:justify-start gap-4 p-2 md:p-3 rounded-xl border-2 border-black bg-spider-red text-white hover:bg-spider-black transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <LogOut size={24} className="shrink-0" />
              <span className="hidden md:block font-bebas text-xl tracking-wide">LOGOUT</span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <GlobalSocketListener />
        {children}
      </main>
    </div>
  );
}
