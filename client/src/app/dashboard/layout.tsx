"use client";

import { useAuth } from "@/components/AuthProvider";
import { GlitchText } from "@/components/GlitchText";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spider-black halftone-bg text-spider-white font-bebas text-4xl">
        LOADING DASHBOARD...
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
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
          <div className="h-20 border-b-4 border-black flex items-center justify-center md:justify-start md:px-6 bg-spider-red">
            <GlitchText text="WEBVERSE" className="hidden md:block text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-tight" textColorClass="text-white" />
            <span className="md:hidden text-3xl font-bebas text-white transform -skew-x-12 -rotate-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">WV</span>
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
                    className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-colors ${
                      isActive 
                        ? 'bg-spider-blue text-white border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                        : 'bg-white text-spider-black border-transparent hover:border-black'
                    }`}
                  >
                    <item.icon size={24} className="shrink-0" />
                    <span className="hidden md:block font-bebas text-xl tracking-wide">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Area / Logout */}
          <div className="p-4 border-t-4 border-black bg-white flex flex-col gap-3">
            <div className="flex items-center gap-3 md:px-2">
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
              className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl border-2 border-black bg-spider-red text-white hover:bg-spider-black transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
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
