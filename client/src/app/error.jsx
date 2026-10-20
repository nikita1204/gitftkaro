'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState.jsx';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console or telemetry
    console.error('Unhandled Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center py-12">
      <ErrorState
        title="Unexpected Application Error"
        message={
          error?.message ||
          'Something went wrong while rendering this page. Please try again.'
        }
        onRetry={() => reset()}
        retryText="Reload View"
        className="max-w-md w-full"
      />
    </div>
  );
}
