'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Gift,
  Shirt,
  Calendar,
  Users,
  Building2,
  Sparkles,
  Search,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  Clock,
  PhoneCall,
  Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { closeMobileMenu, openModal } from '@/redux/slices/uiSlice.js';
import { logoutUser } from '@/redux/slices/authSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: <Gift className="h-4 w-4 text-brand-600" />,
  },
  {
    name: 'Customized T-shirts',
    href: '/category/customized-tshirts',
    icon: <Shirt className="h-4 w-4 text-brand-600" />,
    badge: 'Popular',
  },
  {
    name: 'Event T-shirts',
    href: '/category/event-tshirts',
    icon: <Calendar className="h-4 w-4 text-amber-600" />,
    badge: 'Fests & Sports',
  },
  {
    name: 'Group T-shirts',
    href: '/category/group-tshirts',
    icon: <Users className="h-4 w-4 text-emerald-600" />,
    badge: 'MOQ 10 Pcs',
  },
  {
    name: 'Corporate T-shirts',
    href: '/category/corporate-tshirts',
    icon: <Building2 className="h-4 w-4 text-stone-700" />,
    badge: 'Bulk Discount',
  },
  {
    name: 'Explore All Collections',
    href: '/products',
    icon: <Sparkles className="h-4 w-4 text-brand-500" />,
  },
];

export const MobileNav = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui?.isMobileMenuOpen);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileSearch, setMobileSearch] = useState('');

  const isAdmin = user?.role === 'admin';

  const handleClose = useCallback(() => {
    dispatch(closeMobileMenu());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(mobileSearch.trim())}`);
      handleClose();
      setMobileSearch('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 lg:hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between z-10 p-5 sm:p-6 overflow-y-auto animate-slide-up">
        {/* Top Bar with Brand & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <Link href="/" onClick={handleClose} className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-stone-900 tracking-tight">
                GIFT KRO
              </span>
              <span className="block text-[10px] text-brand-600 font-semibold tracking-wide">
                Raipur Custom Apparel
              </span>
            </div>
          </Link>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar in Mobile Menu */}
        <form onSubmit={handleSearch} className="my-3 relative">
          <input
            type="text"
            placeholder="Search t-shirts & designs..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full bg-stone-50 text-stone-900 placeholder:text-stone-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-300 focus:outline-none focus:border-brand-500"
          />
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
        </form>

        {/* User Session Bar */}
        <div className="mb-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
          {isAuthenticated && user ? (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-stone-900 truncate">{user.name}</span>
                    <Badge variant={isAdmin ? 'gold' : 'brand'} size="sm">
                      {isAdmin ? 'ADMIN' : 'MEMBER'}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <div className="flex space-x-2">
                  <Link
                    href="/account"
                    onClick={handleClose}
                    className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium transition-colors text-[11px]"
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={handleClose}
                      className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium transition-colors text-[11px]"
                    >
                      Admin
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => {
                    handleClose();
                    dispatch(logoutUser());
                  }}
                  className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium text-[11px]"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-900">Welcome to GIFT KRO</p>
                <p className="text-[10px] text-stone-500">Sign in to track orders</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  onClick={handleClose}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 transition-colors flex items-center gap-1"
                >
                  <LogIn className="h-3 w-3" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={handleClose}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 24h Delivery Operational Conditions Callout */}
        <div className="mb-3 p-3 rounded-xl bg-brand-50/70 border border-brand-200/60">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-700 mb-1">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span>24-Hour Express Delivery</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-snug">
            Available in selected Raipur operational zones subject to eligibility & MOQ: <strong>10 pieces</strong>.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 py-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-stone-700 hover:text-brand-600 hover:bg-stone-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-stone-200 space-y-2">
          <Button
            onClick={() => {
              handleClose();
              dispatch(openModal({ modalName: 'quoteModal' }));
            }}
            variant="primary"
            size="md"
            leftIcon={<Send className="h-4 w-4" />}
            className="w-full justify-center text-xs"
          >
            Request Instant Quote
          </Button>

          <a
            href="tel:+917710000000"
            className="flex items-center justify-center space-x-2 w-full py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
            <span>Raipur Helpline: +91 771-000-0000</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
