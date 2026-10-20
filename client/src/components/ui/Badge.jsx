'use client';

import React from 'react';

const variantClasses = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200 font-medium',
  gold: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
  neutral: 'bg-stone-100 text-stone-700 border-stone-200 font-medium',
  outline: 'bg-white text-stone-700 border-stone-300 font-medium',
};

const dotColors = {
  brand: 'bg-brand-500',
  gold: 'bg-amber-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-stone-500',
  outline: 'bg-stone-500',
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5 rounded-full font-semibold',
  md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
};

export const Badge = ({
  children,
  variant = 'brand',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-wide uppercase select-none ${
        variantClasses[variant] || variantClasses.brand
      } ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dotColors[variant] || 'bg-brand-400'
          } animate-pulse`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
