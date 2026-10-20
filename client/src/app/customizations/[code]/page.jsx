'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomizationByCode } from '@/redux/slices/customizationSlice.js';
import {
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  ArrowLeft,
  Users,
  Briefcase,
  PartyPopper,
  User,
  ShieldCheck,
  Download,
} from 'lucide-react';
import Loader from '@/components/ui/Loader.jsx';
import Badge from '@/components/ui/Badge.jsx';


export default function CustomizationViewPage() {
  const { code } = useParams();
  const dispatch = useDispatch();
  const { viewedCustomization, isViewingLoading, viewingError } = useSelector(
    (state) => state.customization
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      dispatch(fetchCustomizationByCode(code));
    }
  }, [code, dispatch]);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isViewingLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader size="lg" text="Retrieving Customization Specification..." />
        <p className="text-xs text-slate-400">Reference: {code}</p>
      </div>
    );
  }

  if (viewingError || !viewedCustomization) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Customization Specification Not Found</h1>
        <p className="text-xs text-slate-400">
          {viewingError || `We couldn't locate any order specification with code "${code}".`}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Catalogue</span>
        </Link>
      </div>
    );
  }

  const c = viewedCustomization;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/products/${c.productSnapshot?.slug || ''}`}
          className="hover:text-white flex items-center space-x-1 text-xs text-slate-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Details</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status:</span>
          <Badge variant="brand" size="sm" className="capitalize">
            {c.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Quote Specification Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Header with Reference Code */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                GIFT KRO Express Custom Specification
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                24h Production Locked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {c.productSnapshot?.name}
            </h1>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3 shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Reference Code</span>
              <span className="text-base font-mono font-black text-brand-400">{c.customizationCode}</span>
            </div>
            <button
              onClick={copyCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy code"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Garment & Order Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Category & Type</span>
            <span className="font-bold text-white text-xs capitalize flex items-center gap-1.5">
              <span>{c.orderType} Custom T-Shirt</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Selected Fabric Color</span>
            <div className="flex items-center space-x-2">
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-700"
                style={{ backgroundColor: c.selectedColor?.hex }}
              />
              <span className="font-bold text-white text-xs">{c.selectedColor?.name}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Quantity</span>
            <span className="font-black text-brand-400 text-sm">{c.totalQuantity} Pieces</span>
          </div>
        </div>

        {/* Size Distribution Matrix */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-200 uppercase tracking-wider">
            Verified Size Breakdown
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Size</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Size Surcharge</th>
                  <th className="py-2.5 px-4 text-right">Subtotal Surcharges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {c.sizeBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-4 font-bold text-white">{item.size}</td>
                    <td className="py-2.5 px-4">{item.quantity} pcs</td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {item.surchargePerUnit > 0 ? `+₹${item.surchargePerUnit}/pc` : '₹0 (Standard)'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      &#8377;{item.totalSurcharge || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Printing Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
            <h2 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Print Placement Locations
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.printLocations?.map((loc, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold"
                >
                  {loc.replace('_', ' ').toUpperCase()}
                </span>
              ))}
            </div>

            {c.customText && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Custom Text:</span>
                <p className="text-xs text-white font-medium mt-0.5">{c.customText}</p>
              </div>
            )}

            {c.printingInstructions && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Instructions:</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{c.printingInstructions}</p>
              </div>
            )}
          </div>

          {/* Attached Artworks */}
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
            <h2 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Attached Artwork & Files ({c.artworks?.length || 0})
            </h2>
            {c.artworks && c.artworks.length > 0 ? (
              <div className="space-y-2">
                {c.artworks.map((art, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-white block truncate">{art.originalName}</span>
                      <span className="text-[10px] text-slate-500">{(art.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <a
                      href={`http://localhost:5000${art.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No artwork files attached.</p>
            )}
          </div>
        </div>

        {/* Pricing Breakdown Summary */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
          <h2 className="text-xs font-black text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            Locked Server Pricing Breakdown
          </h2>

          <div className="flex items-center justify-between text-slate-400">
            <span>Base Garment Price ({c.totalQuantity} pcs &times; &#8377;{c.pricing?.basePricePerUnit})</span>
            <span className="font-semibold text-slate-200">
              &#8377;{c.pricing?.garmentSubtotal?.toLocaleString('en-IN')}
            </span>
          </div>

          {c.pricing?.sizeSurchargeSubtotal > 0 && (
            <div className="flex items-center justify-between text-slate-400">
              <span>Plus Size Surcharges (2XL–4XL)</span>
              <span className="font-semibold text-amber-400">
                +&#8377;{c.pricing.sizeSurchargeSubtotal?.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
            <span>Gross Subtotal</span>
            <span className="font-semibold text-slate-200">
              &#8377;{c.pricing?.subtotal?.toLocaleString('en-IN')}
            </span>
          </div>

          {c.pricing?.discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <span>Volume Discount ({c.pricing?.discountPercent}% OFF)</span>
              <span>-&#8377;{c.pricing.discountAmount?.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
            <span className="text-sm font-bold text-white">Final Total Payable:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-brand-400 block">
                &#8377;{c.pricing?.totalPrice?.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">
                &#8377;{c.pricing?.effectivePricePerPiece}/piece (excl. 5% GST)
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4 text-slate-400">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Coordinator Contact:</span>
            <span className="text-white font-semibold">{c.contactInfo?.name}</span> &bull;{' '}
            <span>{c.contactInfo?.email}</span> &bull; <span>{c.contactInfo?.phone}</span>
            {c.contactInfo?.organization && (
              <span className="block text-slate-400 text-[11px]">Org: {c.contactInfo.organization}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[11px]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Raipur 24h Express Facility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
