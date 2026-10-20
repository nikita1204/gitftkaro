'use client';

import React from 'react';
import { Gift } from 'lucide-react';

export const Loader = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = '',
}) => {
  const sizeMap = {
    sm: {
      ring: 'h-6 w-6 border-2',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      ring: 'h-10 w-10 border-2',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      ring: 'h-16 w-16 border-3',
      icon: 'h-7 w-7',
      text: 'text-base font-semibold',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div
          className={`rounded-full border-brand-500/20 border-t-brand-500 animate-spin ${currentSize.ring}`}
        />
        {/* Centered gift branding icon */}
        <div className="absolute inset-0 flex items-center justify-center text-brand-400">
          <Gift className={`${currentSize.icon} animate-pulse`} />
        </div>
      </div>

      {text && (
        <p className={`text-stone-500 font-medium tracking-wide ${currentSize.text}`}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
