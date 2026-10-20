'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gift, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { loginUser, clearAuthError } from '@/redux/slices/authSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || null;

  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isSubmitting, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  // Clear stale errors when mounting or switching inputs
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Navigate once authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectPath) {
        router.replace(redirectPath);
      } else if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, redirectPath, router]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(clearAuthError());
    dispatch(loginUser({ email: email.trim(), password }));
  };

  // Helper for quick testing
  const fillCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setClientErrors({});
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Gift className="h-6 w-6 text-white" />
            </div>
          </Link>
          <div className="pt-2">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Welcome Back</h1>
              <Badge variant="brand" size="sm">Raipur Hub</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage your custom 24-hour t-shirt orders and account
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            id="login-email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={clientErrors.email}
            leftIcon={<Mail className="h-4 w-4 text-slate-500" />}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={clientErrors.password}
              leftIcon={<Lock className="h-4 w-4 text-slate-500" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full justify-center shadow-lg shadow-brand-600/20"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Testing Presets */}
        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            <span>Quick Login Presets (For Testing):</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@giftkro.com', 'AdminRaipur2026!')}
              className="px-3 py-2 text-left rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all text-xs group"
            >
              <div className="font-bold text-amber-400 group-hover:text-amber-300">Admin Role</div>
              <div className="text-[10px] text-slate-500 truncate">admin@giftkro.com</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('customer@example.com', 'Customer2026!')}
              className="px-3 py-2 text-left rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition-all text-xs group"
            >
              <div className="font-bold text-brand-400 group-hover:text-brand-300">Customer Role</div>
              <div className="text-[10px] text-slate-500 truncate">customer@example.com</div>
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline-offset-4 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
