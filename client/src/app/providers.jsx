'use client';

import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/redux/store.js';
import { AuthProvider } from '@/components/auth/AuthProvider.jsx';

export function Providers({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}

export default Providers;
