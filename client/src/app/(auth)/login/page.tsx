"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 halftone-bg">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-spider-red opacity-10 blur-3xl rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 w-full max-w-md bg-spider-white p-8 comic-panel border-4 border-black"
      >
        <h1 className="text-5xl font-bebas text-spider-red mb-6 text-center transform -rotate-1 skew-x-[-6deg] drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
          LOGIN
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-3 mb-4 font-fredoka border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-blue/50"
              required
            />
          </div>

          <div>
            <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-blue/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`comic-button mt-4 bg-spider-blue text-white py-3 skew-x-[-6deg] ${loading ? 'opacity-80' : ''}`}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center font-fredoka text-spider-black">
          Don't have an account?{" "}
          <Link href="/signup" className="text-spider-red font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
