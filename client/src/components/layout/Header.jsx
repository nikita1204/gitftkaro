'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gift,
  Search,
  ShoppingCart,
  User,
  Menu,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { toggleMobileMenu, openModal } from '@/redux/slices/uiSlice.js';
import { logoutUser } from '@/redux/slices/authSlice.js';
import { fetchCart } from '@/redux/slices/cartSlice.js';
import { Button } from '@/components/ui/Button.jsx';

export const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector((state) => state.ui?.isMobileMenuOpen);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart?.cart);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpenMobile(false);
    }
  };

  const cartCount = cart?.summary?.totalItems || 0;
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Customized T-shirts', href: '/category/customized-tshirts' },
    { name: 'Event T-shirts', href: '/category/event-tshirts' },
    { name: 'Group T-shirts', href: '/category/group-tshirts' },
    { name: 'Corporate T-shirts', href: '/category/corporate-tshirts' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 lg:gap-6">
          {/* 1. GIFT KRO Brand Mark */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors shrink-0">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 whitespace-nowrap">
                    GIFT KRO
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 whitespace-nowrap">
                    Raipur
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium hidden md:block whitespace-nowrap">
                  Custom Apparel &bull; MOQ: 10 Pcs
                </p>
              </div>
            </Link>
          </div>

          {/* 2. Main Navigation (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium text-stone-700">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-lg hover:text-brand-600 hover:bg-stone-50 transition-colors whitespace-nowrap font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* 3. Search UI (Desktop Input) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-xs relative"
          >
            <input
              type="text"
              placeholder="Search t-shirts, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 text-stone-900 placeholder:text-stone-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-stone-200 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            <Search className="h-4 w-4 text-stone-400 absolute left-3 pointer-events-none" />
          </form>

          {/* 4. Action Items (Search Mobile, Account, Cart, Mobile Menu) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle search input"
            >
              {isSearchOpenMobile ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Cart Entry Point */}
            <Link
              href="/cart"
              className="relative px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5 shrink-0"
              title="Shopping Cart (MOQ 10 pcs)"
              id="header-cart-button"
            >
              <ShoppingCart className="h-4 w-4 text-stone-700" />
              <span className="hidden sm:inline font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Entry Point */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all items-center gap-1.5 whitespace-nowrap"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  href="/account"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[70px] sm:max-w-[100px]">{user.name?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={() => dispatch(logoutUser())}
                  className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <User className="h-3.5 w-3.5 text-stone-500" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors whitespace-nowrap shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Quote CTA (Desktop) */}
            <Button
              onClick={() => dispatch(openModal({ modalName: 'quoteModal' }))}
              variant="outline"
              size="sm"
              className="hidden 2xl:inline-flex whitespace-nowrap text-xs"
            >
              Get Bulk Quote
            </Button>

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              type="button"
              className="xl:hidden p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              id="mobile-menu-toggle"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {isSearchOpenMobile && (
          <form
            onSubmit={handleSearchSubmit}
            className="lg:hidden pb-3 pt-1 border-t border-stone-100 flex items-center relative animate-fade-in"
          >
            <input
              type="text"
              placeholder="Search custom t-shirts, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 text-stone-900 placeholder:text-stone-400 text-xs rounded-xl pl-9 pr-16 py-2.5 border border-stone-300 focus:outline-none focus:border-brand-500"
              autoFocus
            />
            <Search className="h-4 w-4 text-stone-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1"
            >
              Search
            </button>
          </form>
        )}
      </div>
    </header>
  );
};

export default Header;
