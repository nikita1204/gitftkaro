'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button.jsx';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry = null,
  retryText = 'Try Again',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-rose-50 border border-rose-200 ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-600 mb-4 border border-rose-200">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          className="border-rose-300 hover:bg-rose-100 text-rose-700"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
