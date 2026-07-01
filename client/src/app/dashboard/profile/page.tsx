"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import { User, Save, Loader2, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatar }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        // Refresh auth context
        await checkAuth();
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bebas text-spider-blue glitch-text mb-2" data-text="
          YOUR PROFILE
        ">
          YOUR PROFILE
        </h1>
        <p className="font-fredoka text-spider-white/70 mb-10">
          Customize your multiverse identity.
        </p>
      </motion.div>

      <div className="grid gap-8">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            <Camera size={24} className="text-spider-blue" />
            AVATAR
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img
                src={avatar || "/spider.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-black bg-spider-red object-cover shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Enter avatar URL..."
                className="w-full px-4 py-3 font-fredoka text-sm text-spider-black border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-spider-blue bg-white"
              />
              <p className="font-fredoka text-xs text-spider-black/40 mt-2">
                Paste a URL to your avatar image. Leave blank for default.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Display Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4 flex items-center gap-2">
            <User size={24} className="text-spider-red" />
            DISPLAY NAME
          </h3>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name..."
            maxLength={50}
            className="w-full px-4 py-3 font-fredoka text-lg text-spider-black border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-spider-blue bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          />
          <div className="flex justify-between mt-2">
            <p className="font-fredoka text-xs text-spider-black/40">
              This is how other spiders will see you.
            </p>
            <span className="font-fredoka text-xs text-spider-black/40">
              {displayName.length}/50
            </span>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-spider-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <h3 className="font-bebas text-2xl text-spider-black mb-4">
            📝 BIO
          </h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the multiverse about yourself..."
            maxLength={160}
            rows={4}
            className="w-full px-4 py-3 font-fredoka text-sm text-spider-black border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-spider-blue bg-white resize-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          />
          <div className="flex justify-between mt-2">
            <p className="font-fredoka text-xs text-spider-black/40">
              Share a short intro about yourself.
            </p>
            <span className="font-fredoka text-xs text-spider-black/40">
              {bio.length}/160
            </span>
          </div>
        </motion.div>

        {/* Username (read-only) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-spider-white/60 p-6 rounded-xl border-4 border-black/30"
        >
          <h3 className="font-bebas text-2xl text-spider-black/50 mb-4">
            🔒 USERNAME
          </h3>
          <input
            type="text"
            value={user?.username || ""}
            disabled
            className="w-full px-4 py-3 font-fredoka text-lg text-spider-black/40 border-2 border-black/20 rounded-xl bg-gray-100 cursor-not-allowed"
          />
          <p className="font-fredoka text-xs text-spider-black/30 mt-2">
            Username cannot be changed.
          </p>
        </motion.div>

        {/* Error / Success */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 p-4 rounded-xl border-2 border-red-400 font-fredoka"
          >
            {error}
          </motion.div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 text-green-700 p-4 rounded-xl border-2 border-green-400 font-fredoka flex items-center gap-2"
          >
            <span className="text-xl">✓</span> Profile updated successfully!
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-spider-red text-white font-bebas text-2xl tracking-wider border-4 border-black rounded-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {saving ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save size={24} />
              SAVE PROFILE
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
