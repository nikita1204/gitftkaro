'use client';

import React from 'react';
import { Sparkles, X, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { dismissAnnouncement } from '@/redux/slices/uiSlice.js';

export const AnnouncementBar = () => {
  const dispatch = useAppDispatch();
  const isDismissed = useAppSelector((state) => state.ui?.isAnnouncementDismissed);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Promotional announcement"
      className="bg-brand-50 border-b border-brand-200/80 px-4 py-2 text-xs text-stone-700 relative z-50 transition-all duration-300"
    >
      <div className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center gap-1 font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full border border-brand-200 text-[11px]">
            <Clock className="h-3 w-3 text-brand-600" /> Raipur Operational Hub
          </span>
          <span className="hidden sm:inline text-stone-700">
            24-Hour delivery available in selected Raipur areas subject to operational conditions &bull; MOQ: 10 Pieces
          </span>
          <span className="sm:hidden text-stone-700">
            Raipur 24h Delivery (Selected Areas &bull; MOQ 10 pcs)
          </span>
        </div>

        <button
          onClick={() => dispatch(dismissAnnouncement())}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-brand-100 transition-colors shrink-0"
          aria-label="Dismiss announcement banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default AnnouncementBar;
