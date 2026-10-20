'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon = null,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  action = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-stone-200 shadow-xs ${className}`}
    >
      <div className="p-4 rounded-2xl bg-stone-100 text-brand-600 mb-4 border border-stone-200">
        {icon || <PackageOpen className="h-8 w-8 text-stone-400" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
