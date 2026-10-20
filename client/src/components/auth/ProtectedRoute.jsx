'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux.js';
import { logoutUser } from '@/redux/slices/authSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

/**
 * Route protection wrapper for sensitive customer and administrator pages.
 * Handles unauthenticated redirection, session loading states, and role enforcement.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'admin'|'customer'} [props.requiredRole]
 */
export function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // 1. Session verification loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center border border-slate-800 shadow-2xl space-y-4">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Verifying Session</h3>
            <p className="text-xs text-slate-400 mt-1">
              Securing connection with GIFT KRO authorization gateway...
            </p>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-600 to-amber-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state (useEffect is triggering redirect)
  if (!isAuthenticated) {
    return null;
  }

  // 3. Role-based authorization denial
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full border border-rose-900/50 shadow-2xl text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>

          <div>
            <Badge variant="rose" size="md">
              403 Forbidden Access
            </Badge>
            <h2 className="text-xl font-black text-white mt-3">
              Administrator Permissions Required
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your account (<strong className="text-slate-200">{user?.email}</strong>) is assigned
              the <strong className="text-amber-400 uppercase">{user?.role}</strong> role, which
              does not have authorization to view this area.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Return Home
            </Button>
            <Button
              onClick={async () => {
                await dispatch(logoutUser());
                router.push('/login?redirect=' + encodeURIComponent(pathname));
              }}
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized
  return children;
}

export default ProtectedRoute;
