"use client";

import Link from "next/link";
import { GlitchText } from "@/components/GlitchText";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ alias: '', universe: '', content: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ alias: '', universe: '', content: '' });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-x-hidden halftone-bg">
      <div className="absolute top-4 left-4 z-50">
        <Link 
          href="/"
          className="flex items-center gap-2 font-bebas text-xl text-spider-black bg-spider-white border-2 border-black px-4 py-2 hover:bg-[#39FF14] transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={20} /> ESCAPE
        </Link>
      </div>

      <div className="z-10 w-full max-w-3xl mt-16 md:mt-24">
        <div className="text-center mb-12">
          <MessageSquareWarning className="w-20 h-20 mx-auto text-[#39FF14] mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <GlitchText 
            text="DAILY BUGLE TIP LINE" 
            textColorClass="text-[#39FF14]"
            className="text-5xl md:text-7xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider"
          />
          <p className="font-fredoka text-xl text-spider-white mt-4 bg-black/50 px-4 py-2 rounded-xl inline-block border-2 border-white/20">
            Got pictures of Spider-Man? Or just some feedback for the app?
          </p>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="comic-panel bg-spider-white text-spider-black p-8 relative overflow-hidden"
        >
          {submitted ? (
            <div className="text-center py-12">
              <h2 className="font-bebas text-5xl text-spider-red mb-4">MESSAGE RECEIVED!</h2>
              <p className="font-fredoka text-xl">J. Jonah Jameson is reviewing your submission right now.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 font-bebas text-xl text-spider-blue hover:underline"
              >
                Send Another Tip
              </button>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block font-bebas text-2xl mb-2">YOUR ALIAS</label>
                <input 
                  type="text" 
                  required
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                  placeholder="e.g. Peter Parker"
                  className="w-full px-4 py-3 font-fredoka border-4 border-spider-black rounded-lg focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                />
              </div>
              
              <div>
                <label className="block font-bebas text-2xl mb-2">YOUR UNIVERSE (OPTIONAL)</label>
                <input 
                  type="text"
                  value={formData.universe}
                  onChange={(e) => setFormData({...formData, universe: e.target.value})}
                  placeholder="e.g. Earth-1610"
                  className="w-full px-4 py-3 font-fredoka border-4 border-spider-black rounded-lg focus:outline-none focus:border-spider-blue shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block font-bebas text-2xl mb-2">THE SCOOP (FEEDBACK)</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Tell us what you think..."
                  className="w-full px-4 py-3 font-fredoka border-4 border-spider-black rounded-lg focus:outline-none focus:border-spider-red shadow-[4px_4px_0_0_rgba(0,0,0,1)] resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="comic-button bg-[#39FF14] text-spider-black w-full py-4 text-2xl hover:bg-spider-black hover:text-[#39FF14] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT TO THE BUGLE'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}
