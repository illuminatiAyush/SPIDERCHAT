"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const securityQuestions = [
    "What is the name of Peter Parker's uncle?",
    "Which universe is Spider-Gwen from?",
    "What is the true identity of the Prowler in Earth-1610?",
    "Who is the CEO of Alchemax?",
    "Where did Peter Parker get bitten by the radioactive spider?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const finalQuestion = isCustomQuestion ? customQuestion : securityQuestion;

      if (!finalQuestion || !securityAnswer) {
        throw new Error("Please select or write a security question and provide an answer");
      }
      await signup({ username, password, securityQuestion: finalQuestion, securityAnswer });
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
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-spider-blue opacity-10 blur-3xl rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 w-full max-w-md bg-spider-white p-8 comic-panel border-4 border-black"
      >
        <h1 className="text-5xl font-bebas text-spider-blue mb-6 text-center transform -rotate-1 skew-x-[-6deg] drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
          SIGNUP
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
              className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
              required
            />
          </div>

          <div>
            <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50 pr-12"
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

          <div>
            <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Security Question</label>
            <select
              value={isCustomQuestion ? "custom" : securityQuestion}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setIsCustomQuestion(true);
                  setSecurityQuestion("");
                } else {
                  setIsCustomQuestion(false);
                  setSecurityQuestion(e.target.value);
                }
              }}
              className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
              required
            >
              <option value="" disabled>Select a Multiverse Question</option>
              {securityQuestions.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
              <option value="custom">Write my own custom question...</option>
            </select>
          </div>

          {isCustomQuestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Custom Question</label>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="E.g., What is my favorite symbiote?"
                className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
                required
              />
            </motion.div>
          )}

          <div>
            <label className="block font-bebas text-xl mb-1 text-spider-black transform -skew-x-6">Security Answer</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full p-3 font-fredoka border-2 border-spider-black bg-white focus:outline-none focus:ring-4 focus:ring-spider-red/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`comic-button mt-4 bg-spider-red text-white py-3 skew-x-[-6deg] ${loading ? 'opacity-80' : ''}`}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-6 text-center font-fredoka text-spider-black">
          Already have an account?{" "}
          <Link href="/login" className="text-spider-blue font-bold hover:underline">
            Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
