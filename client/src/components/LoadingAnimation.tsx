import React from 'react';

interface LoadingAnimationProps {
  size?: number | string;
  className?: string;
  text?: string;
  inline?: boolean;
}

export function LoadingAnimation({ size = 64, className = '', text, inline = false }: LoadingAnimationProps) {
  // If size is a number, we use px, else we assume it's a tailwind class like 'w-16 h-16'
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};
  const sizeClass = typeof size === 'string' ? size : '';

  const loaderContent = (
    <div 
      className={`relative overflow-hidden rounded-full flex items-center justify-center border-2 border-spider-red/30 shadow-[0_0_15px_rgba(226,54,54,0.3)] shrink-0 ${sizeClass}`}
      style={sizeStyle}
    >
      {/* 200% size combined with rounded-full ensures we zoom in to crop the 50% central portion of the GIF */}
      <img 
        src="/loading_animation.gif" 
        alt="Loading..." 
        className="absolute w-[200%] h-[200%] object-cover max-w-none pointer-events-none"
      />
    </div>
  );

  if (inline) {
    return (
      <div className={`flex flex-row items-center gap-2 ${className}`}>
        {loaderContent}
        {text && <span className="font-bebas tracking-wider animate-pulse">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 w-full ${className}`}>
      {loaderContent}
      {text && (
        <p className="font-bebas tracking-wider text-spider-white text-xl animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
}
