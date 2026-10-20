'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux.js';
import { checkAuth } from '@/redux/slices/authSlice.js';

export function AuthProvider({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for existing session token in HTTP-only cookie
    dispatch(checkAuth());
  }, [dispatch]);

  return children;
}
