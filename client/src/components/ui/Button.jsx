'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary:
    'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow transition-all active:scale-[0.98] font-medium',
  secondary:
    'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300/80 active:scale-[0.98]',
  gold: 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm active:scale-[0.98]',
  outline:
    'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900 active:scale-[0.98]',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isButtonDisabled = disabled || isLoading;
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  return (
    <button
      ref={ref}
      type={type}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
