'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, Lock, Mail, User as UserIcon, Phone, MapPin, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { registerUser, clearAuthError } from '@/redux/slices/authSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isSubmitting, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Raipur',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (clientErrors[field]) {
      setClientErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must include at least one letter and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(clearAuthError());
    dispatch(
      registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim() || 'Raipur',
        password: formData.password,
      })
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Gift className="h-6 w-6 text-white" />
            </div>
          </Link>
          <div className="pt-2">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
              <Badge variant="brand" size="sm">Raipur Gifting</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Join GIFT KRO for custom bulk t-shirts, MOQ 10 pcs, and 24-hour printing
            </p>
          </div>
        </div>

        {/* Raipur Perk Mini Banner */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5 text-xs text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Instant quote generation &bull; Express delivery across Raipur</span>
        </div>

        {/* Server Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            type="text"
            id="register-name"
            placeholder="Nikita Rahangdale"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={clientErrors.name}
            leftIcon={<UserIcon className="h-4 w-4 text-slate-500" />}
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            id="register-email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={clientErrors.email}
            leftIcon={<Mail className="h-4 w-4 text-slate-500" />}
            required
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              type="tel"
              id="register-phone"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={clientErrors.phone}
              leftIcon={<Phone className="h-4 w-4 text-slate-500" />}
              autoComplete="tel"
            />

            <Input
              label="City"
              type="text"
              id="register-city"
              placeholder="Raipur"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              leftIcon={<MapPin className="h-4 w-4 text-slate-500" />}
            />
          </div>

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="register-password"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={clientErrors.password}
            leftIcon={<Lock className="h-4 w-4 text-slate-500" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            helperText="Must contain at least 8 characters with letters & numbers"
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            id="register-confirm-password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={clientErrors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4 text-slate-500" />}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full justify-center shadow-lg shadow-brand-600/20 mt-2"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline-offset-4 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
