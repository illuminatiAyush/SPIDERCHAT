"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/forgot-password/get-question?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch security question");
      
      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, answer: securityAnswer, newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 halftone-bg">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-spider-red opacity-10 blur-3xl rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 w-full max-w-md bg-spider-white p-8 comic-panel border-4 border-black"
      >
        <h1 className="text-4xl font-bebas text-spider-black mb-6 text-center transform -rotate-1 skew-x-[-6deg] drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
          FORGOT PASSWORD?
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-3 mb-4 font-fredoka border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 text-white p-3 mb-4 font-fredoka border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleFetchQuestion} className="flex flex-col gap-4">
            <div>
              <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 font-fredoka border-2 border-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`comic-button mt-4 bg-spider-red text-white py-3 skew-x-[-6deg] ${loading ? 'opacity-80' : ''}`}
            >
              {loading ? "SEARCHING MULTIVERSE..." : "FIND ACCOUNT"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="bg-spider-blue/10 p-4 border-2 border-spider-blue mb-2">
              <label className="block font-bebas text-xl mb-1 text-spider-blue">Security Question</label>
              <p className="font-fredoka text-spider-black italic">{securityQuestion}</p>
            </div>

            <div>
              <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Your Answer</label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full p-3 font-fredoka border-2 border-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
                required
              />
            </div>

            <div>
              <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 font-fredoka border-2 border-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-spider-black hover:text-spider-red transition-colors"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`comic-button mt-4 bg-spider-red text-white py-3 skew-x-[-6deg] ${loading ? 'opacity-80' : ''}`}
            >
              {loading ? "RESETTING..." : "RESET PASSWORD"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center font-fredoka text-spider-black">
          Remembered your password?{" "}
          <Link href="/login" className="text-spider-blue font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
