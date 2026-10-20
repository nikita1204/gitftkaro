'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  ShieldCheck,
  Clock,
  ArrowRight,
  Shirt,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { logoutUser } from '@/redux/slices/authSlice.js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

function AccountContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <Badge variant={isAdmin ? 'gold' : 'brand'} size="sm">
                  {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {isAdmin && (
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="h-4 w-4 text-amber-400" />}
              >
                Admin Console
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Account Details & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-brand-400" />
            <span>Profile Information</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                Full Name
              </span>
              <span className="font-semibold text-slate-200">{user?.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                Email Address
              </span>
              <span className="font-mono text-slate-300">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                Phone Number
              </span>
              <span className="text-slate-300">{user?.phone || 'Not provided'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                Delivery City
              </span>
              <span className="text-slate-300">
                {user?.address?.city || 'Raipur'}, {user?.address?.state || 'Chhattisgarh'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Member Since
              </span>
              <span className="text-slate-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {/* Raipur Express Benefits */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Raipur Express Privileges</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Shirt className="h-4 w-4 text-brand-400" />
                <span>24-Hour Custom Printing Guaranteed</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct dispatch from Raipur printing hub for customized, event, group, and corporate orders.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Minimum Order Quantity: 10 Pieces</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Wholesale bulk rate discounts applied automatically on group orders above 25 pieces.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/#catalog"
                className="inline-flex items-center text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <span>Browse T-Shirt Catalog</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
