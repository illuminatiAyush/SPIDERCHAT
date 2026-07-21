"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const QUOTES = [
  "HELLO, PETER.",
  "YOU'RE A MISTAKE.",
  "NAH. I'M GONNA DO MY OWN THING.",
  "WITH GREAT POWER...",
  "ANYONE CAN WEAR THE MASK.",
  "WHAT'S UP, DANGER?",
  "ONE LAST TIME.",
  "YOU'RE LIKE ME.",
  "LEAP OF FAITH.",
  "WATCH THE HANDS.",
  "NO HAPPY ENDING.",
  "THE HARDEST PART.",
  "KEEP GOING.",
  "YOU GOT THIS."
];

interface TextElement {
  id: number;
  text: string;
  layer: number;
  x: number;
  y: number;
  rot: number;
  scale: number;
  duration: number;
  delay: number;
  color: string;
  outline: boolean;
  align?: 'left' | 'right';
}

export function HeroTypographyLayer() {
  const [elements, setElements] = useState<TextElement[]>([]);

  useEffect(() => {
    const colors = ['rgba(255,255,255,0.25)', 'rgba(226, 54, 54, 0.25)', 'rgba(80, 72, 229, 0.25)', 'rgba(57, 255, 20, 0.25)']; // Added neon green for craziness

    // Exactly 4 corners relative to the 100vh container
    const corners = [
      { align: 'left', x: 5, y: 15 },   // Top Left
      { align: 'right', x: 5, y: 15 },  // Top Right
      { align: 'left', x: 5, y: 75 },   // Bottom Left
      { align: 'right', x: 5, y: 75 }   // Bottom Right
    ];

    const generated: TextElement[] = corners.map((corner, i) => ({
      id: i,
      text: QUOTES[Math.floor(Math.random() * QUOTES.length)],
      layer: 2,
      x: corner.x, 
      y: corner.y,
      rot: Math.random() * 20 - 10, // Reduced rotation slightly to avoid extreme clipping
      scale: Math.random() * 0.3 + 0.7, // Reduced max scale slightly
      duration: 0, delay: 0,
      color: colors[0], 
      outline: false,
      align: corner.align as 'left' | 'right'
    }));

    setElements(generated);
  }, []);

  if (elements.length === 0) return null;

  // Extremely varied system fonts that don't rely on Next.js font loaders
  const CRAZY_FONTS = [
    "'Impact', Charcoal, sans-serif",
    "'Comic Sans MS', 'Comic Sans', cursive",
    "'Courier New', Courier, monospace",
    "'Arial Black', Gadget, sans-serif",
    "'Georgia', serif",
    "'Lucida Console', Monaco, monospace",
    "'Brush Script MT', cursive",
    "'Trebuchet MS', Helvetica, sans-serif"
  ];
  
  const WORD_COLORS = ['rgba(255,255,255,0.25)', 'rgba(226, 54, 54, 0.25)', 'rgba(80, 72, 229, 0.25)', 'rgba(255, 215, 0, 0.25)'];

  return (
    <div 
      className="absolute top-0 left-0 right-0 h-[100vh] overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .spider-typography {
          position: absolute;
          text-transform: uppercase;
          line-height: 1.1;
          max-width: 35vw; /* Prevent from stretching into the center */
        }
        .layer-2 {
          font-size: 2rem;
          filter: blur(0px);
          letter-spacing: 0.05em;
        }
      `}} />
      
      {elements.map((el) => {
        const words = el.text.split(" ");

        return (
          <div
            key={el.id}
            className={clsx(
              "spider-typography", 
              `layer-${el.layer}`,
              el.outline && "text-outline"
            )}
            style={{
              [el.align || 'left']: `${el.x}%`,
              top: `${el.y}%`,
              transform: `rotate(${el.rot}deg) scale(${el.scale})`,
              transformOrigin: el.align === 'left' ? 'left center' : 'right center',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: el.align === 'left' ? 'flex-start' : 'flex-end'
            } as React.CSSProperties}
          >
            {words.map((word, wIdx) => {
              const fontIndex = (el.id * 7 + wIdx * 13) % CRAZY_FONTS.length;
              const colorIndex = (el.id * 3 + wIdx * 5) % WORD_COLORS.length;
              
              // Add completely chaotic variations to weight, style, and spacing
              const weights = [100, 300, 400, 700, 900];
              const styles = ['normal', 'italic', 'oblique'];
              const letterSpacings = ['-0.05em', '0', '0.1em', '0.25em'];
              
              const fontWeight = weights[(el.id * 2 + wIdx * 7) % weights.length];
              const fontStyle = styles[(el.id * 5 + wIdx * 11) % styles.length];
              const letterSpacing = letterSpacings[(el.id * 8 + wIdx * 19) % letterSpacings.length];

              return (
                <span 
                  key={wIdx} 
                  style={{ 
                    fontFamily: CRAZY_FONTS[fontIndex],
                    color: WORD_COLORS[colorIndex],
                    fontWeight,
                    fontStyle,
                    letterSpacing,
                    display: 'inline-block'
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

