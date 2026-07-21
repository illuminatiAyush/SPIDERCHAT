"use client";

import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

const STYLE_VARIANTS = [
  "spider-logo-classic",
  "spider-logo-condensed",
  "spider-logo-classic",
  "spider-logo-classic"
];

const GLITCH_COLORS = [
  "text-spider-red",
  "text-spider-blue",
  "text-[#00F5FF]", // Cyan
  "text-[#FF00FF]", // Magenta
  "text-[#39FF14]", // Neon Green
  "text-[#FFD700]", // Gold
  "text-[#FF4500]", // Orange Red
  "text-[#FF1493]", // Deep Pink
  "text-[#7FFF00]", // Chartreuse
  "text-[#9400D3]", // Dark Violet
  "text-white",
];

interface GlitchTextProps {
  text: string;
  className?: string;
  textColorClass?: string;
  glitchVariants?: string[];
}

export function GlitchText({ 
  text: defaultText, 
  className, 
  textColorClass = "text-spider-red",
  glitchVariants = [] 
}: GlitchTextProps) {
  const [text, setText] = useState(defaultText);
  const [styleState, setStyleState] = useState(STYLE_VARIANTS[0]);
  const [activeColor, setActiveColor] = useState(textColorClass);
  const [isGlitching, setIsGlitching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Array stringified to avoid ref inequality
    const allTextVariants = [defaultText, ...glitchVariants, defaultText, defaultText, defaultText];
    
    const triggerGlitch = () => {
      setIsGlitching(true);

      const nextText = allTextVariants[Math.floor(Math.random() * allTextVariants.length)];
      const nextStyle = STYLE_VARIANTS[Math.floor(Math.random() * STYLE_VARIANTS.length)];
      const nextColor = GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)];
      
      setText(nextText);
      setStyleState(nextStyle);
      setActiveColor(nextColor);

      const glitchDuration = Math.random() * 300 + 100;
      
      setTimeout(() => {
        setIsGlitching(false);
        setText(defaultText);           // Revert to original text
        setStyleState(STYLE_VARIANTS[0]); // Revert to original style
        setActiveColor(textColorClass); // Revert to the main color
      }, glitchDuration);

      const nextGlitchIn = 2500;
      timeoutRef.current = setTimeout(triggerGlitch, nextGlitchIn);
    };

    const initialDelay = Math.random() * 1000 + 500;
    timeoutRef.current = setTimeout(triggerGlitch, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultText, textColorClass, JSON.stringify(glitchVariants)]);

  return (
    <div className={clsx("spiderverse-logo-wrapper relative inline-block", className)}>
      <div
        className={clsx(
          "spiderverse-logo-base",
          activeColor,
          styleState,
          isGlitching && "is-glitching"
        )}
        data-text={text}
      >
        <span className="logo-layer logo-layer-red" aria-hidden="true">{text}</span>
        <span className="logo-layer logo-layer-cyan" aria-hidden="true">{text}</span>
        <span className="logo-layer logo-layer-blue" aria-hidden="true">{text}</span>
        <span className="logo-layer logo-layer-base">{text}</span>
        <div className="logo-halftone-overlay" aria-hidden="true"></div>
      </div>
    </div>
  );
}
