'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gift,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  CheckCircle2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';

const raipurServiceAreas = [
  'Pandri',
  'Telibandha',
  'Shankar Nagar',
  'Devendra Nagar',
  'Tatibandh',
  'VIP Road',
  'Samta Colony',
  'Civil Lines',
  'Gudhiyari',
  'Pachpedi Naka',
];

export const Footer = () => {
  const [phoneInput, setPhoneInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setPhoneInput('');
        setSubmitted(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-white border-t border-stone-200 mt-20 pt-16 pb-12 text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust & Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-stone-200">
          <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Eligible 24-Hour Dispatch</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Next-day delivery available for qualifying orders in selected Raipur areas, subject to production capacity.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Minimum Order: 10 Pieces</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Accessible bulk threshold tailored for college fests, corporate teams, and reunion groups.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Industrial Quality Fabric</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                100% bio-washed combed cotton with high-density screen printing and direct-to-film transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-stone-200">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-sm">
                <Gift className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-stone-900 tracking-tight">
                GIFT KRO
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm">
              Raipur&apos;s custom merchandise platform specializing in customized T-shirts, event apparel, group wear, and corporate uniforms.
            </p>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                <AlertCircle className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Raipur Delivery Terms</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">
                24-hour delivery is available exclusively in selected Raipur operational zones and is subject to artwork confirmation, stock availability, and operational conditions. Delivery is not guaranteed for every order.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-stone-500 pt-1">
              <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Raipur, Chhattisgarh 492001</span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li>
                <Link href="/category/customized-tshirts" className="hover:text-brand-600 transition-colors">
                  Customized T-shirts
                </Link>
              </li>
              <li>
                <Link href="/category/event-tshirts" className="hover:text-brand-600 transition-colors">
                  Event T-shirts
                </Link>
              </li>
              <li>
                <Link href="/category/group-tshirts" className="hover:text-brand-600 transition-colors">
                  Group T-shirts
                </Link>
              </li>
              <li>
                <Link href="/category/corporate-tshirts" className="hover:text-brand-600 transition-colors">
                  Corporate T-shirts
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-600 transition-colors font-medium text-stone-800">
                  All Collections &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Raipur Hub Coverage */}
          <div>
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Raipur Service Areas
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {raipurServiceAreas.map((area) => (
                <span
                  key={area}
                  className="px-2 py-1 rounded-md text-[11px] bg-stone-100 text-stone-600 border border-stone-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div>
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Get Fast Quote
            </h5>
            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
              Enter phone for instant pricing details via WhatsApp:
            </p>

            {submitted ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Thank you! A Raipur executive will reach out shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="tel"
                  placeholder="+91 98765-43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  rightIcon={<Send className="h-3 w-3" />}
                >
                  Request Callback
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} GIFT KRO. All rights reserved.</p>

          <div className="flex items-center space-x-3">
            <span className="text-stone-500 font-medium">
              Next.js App Router &bull; Redux Toolkit &bull; Express Backend
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
