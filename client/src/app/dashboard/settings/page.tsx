"use client";

import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import { Moon, Sun, Volume2, VolumeX, Bell, BellOff, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(false);

  const requestNotifPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setDesktopNotifs(permission === "granted");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bebas text-spider-blue glitch-text mb-2" data-text="
          SETTINGS
        ">
          SETTINGS
        </h1>
        <p className="font-fredoka text-spider-white/70 mb-10">
          Configure your multiverse experience.
        </p>
      </motion.div>

      <div className="grid gap-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            {darkMode ? <Moon size={24} className="text-spider-blue" /> : <Sun size={24} className="text-yellow-500" />}
            APPEARANCE
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-fredoka text-spider-black font-semibold">Dark Mode</p>
              <p className="font-fredoka text-xs text-spider-black/50">
                Toggle between dark and light themes.
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-8 rounded-full border-2 border-black transition-colors relative ${
                darkMode ? "bg-spider-blue" : "bg-gray-300"
              }`}
            >
              <motion.div
                animate={{ x: darkMode ? 24 : 2 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full border border-black shadow"
              />
            </button>
          </div>
        </motion.div>

        {/* Sound */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            {sounds ? <Volume2 size={24} className="text-green-500" /> : <VolumeX size={24} className="text-gray-400" />}
            SOUNDS
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-fredoka text-spider-black font-semibold">Message Sounds</p>
              <p className="font-fredoka text-xs text-spider-black/50">
                Play a sound when new messages arrive.
              </p>
            </div>
            <button
              onClick={() => setSounds(!sounds)}
              className={`w-14 h-8 rounded-full border-2 border-black transition-colors relative ${
                sounds ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <motion.div
                animate={{ x: sounds ? 24 : 2 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full border border-black shadow"
              />
            </button>
          </div>
        </motion.div>

        {/* Desktop Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            {desktopNotifs ? <Bell size={24} className="text-spider-red" /> : <BellOff size={24} className="text-gray-400" />}
            DESKTOP NOTIFICATIONS
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-fredoka text-spider-black font-semibold">Push Notifications</p>
              <p className="font-fredoka text-xs text-spider-black/50">
                Get notified even when you're away.
              </p>
            </div>
            <button
              onClick={requestNotifPermission}
              className={`w-14 h-8 rounded-full border-2 border-black transition-colors relative ${
                desktopNotifs ? "bg-spider-red" : "bg-gray-300"
              }`}
            >
              <motion.div
                animate={{ x: desktopNotifs ? 24 : 2 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full border border-black shadow"
              />
            </button>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            <Shield size={24} className="text-spider-black" />
            ACCOUNT
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-black/10">
              <span className="font-fredoka text-spider-black/70">Username</span>
              <span className="font-bebas text-lg text-spider-black">@{user?.username}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-fredoka text-spider-black/70">Member since</span>
              <span className="font-fredoka text-spider-black/70 text-sm">Recently joined</span>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-50 p-6 rounded-xl border-4 border-red-400 shadow-[4px_4px_0_0_rgba(220,38,38,0.5)]"
        >
          <h3 className="font-bebas text-2xl text-red-600 mb-4">
            ⚠️ DANGER ZONE
          </h3>
          <p className="font-fredoka text-sm text-red-600/70 mb-4">
            Logging out will end your current session.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="w-full py-3 bg-red-500 text-white font-bebas text-xl border-2 border-red-700 rounded-xl hover:bg-red-600 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            LOG OUT
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
