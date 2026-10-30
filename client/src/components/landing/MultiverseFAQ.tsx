"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { ChevronDown, HelpCircle, Shield, Zap, Lock, Globe } from "lucide-react";

const faqs = [
  {
    question: "WHAT IS SPIDERCHAT?",
    answer:
      "SpiderChat is a high-speed, real-time web messaging platform built with a comic-book Spider-Verse aesthetic. It allows users to warp into instant public chat rooms using room codes or connect privately through encrypted direct messaging with friends.",
    icon: <Globe className="text-spider-red" size={24} />,
  },
  {
    question: "ARE PUBLIC ROOM MESSAGES SAVED ON THE SERVER?",
    answer:
      "No. All public room chats are 100% ephemeral. Messages are relayed in-memory via WebSockets and are NEVER written to a database or disk. When participants leave and a room expires, all messages evaporate forever without a trace.",
    icon: <Shield className="text-spider-blue" size={24} />,
  },
  {
    question: "DO I NEED AN ACCOUNT TO USE SPIDERCHAT?",
    answer:
      "No account required! You can join or create public rooms anonymously as a guest using any alias. Accounts are only needed if you want persistent direct messaging (DMs), friend requests, and profile customization.",
    icon: <Zap className="text-spider-red" size={24} />,
  },
  {
    question: "HOW DO DIRECT MESSAGES WORK?",
    answer:
      "Authenticated users can search for friends, send multiverse friend requests, and chat privately in 1-on-1 DMs. Direct messages feature instant delivery, emoji reactions, typing indicators, and unread counters.",
    icon: <Lock className="text-spider-blue" size={24} />,
  },
  {
    question: "IS SPIDERCHAT FREE ACROSS ALL UNIVERSES?",
    answer:
      "Yes! SpiderChat is 100% free and open source. There are no subscriptions, ads, or paywalls anywhere in the multiverse.",
    icon: <HelpCircle className="text-spider-red" size={24} />,
  },
];

export default function MultiverseFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-32 w-full px-4 max-w-4xl mx-auto" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex justify-center flex-wrap gap-4 mb-12">
        <GlitchText
          text="MULTIVERSE"
          textColorClass="text-foreground"
          className="text-5xl md:text-6xl"
        />
        <GlitchText
          text="INTEL & FAQ"
          textColorClass="text-spider-blue"
          className="text-5xl md:text-6xl"
        />
      </div>

      <h2 id="faq-heading" className="sr-only">
        Frequently Asked Questions about SpiderChat
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="comic-panel bg-spider-white border-4 border-black text-spider-black overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bebas text-2xl md:text-3xl hover:bg-spider-blue/10 transition-colors focus:outline-none focus:ring-2 focus:ring-spider-red"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  {faq.icon}
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={28} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 font-fredoka text-lg text-spider-black/90 border-t-2 border-black/10 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

