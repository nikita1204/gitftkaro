import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const SectionHeading = ({
  tag = '',
  title = '',
  description = '',
  actionText = '',
  actionHref = '',
  centered = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col ${
        centered
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end justify-between'
      } gap-3 ${className}`}
    >
      <div className={centered ? 'max-w-2xl' : 'max-w-xl'}>
        {tag && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
            {tag}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && !centered && (
        <Link
          href={actionHref}
          className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0 self-start sm:self-auto group"
        >
          <span>{actionText}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeading;
