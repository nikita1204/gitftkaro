'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCartItems,
} from '@/redux/slices/cartSlice.js';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Info,
  Package,
} from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import Loader from '@/components/ui/Loader.jsx';
import { DeliveryEstimator } from '@/components/delivery/DeliveryEstimator.jsx';

const PLUS_SIZES = new Set(['2XL', '3XL', '4XL']);

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart, isLoading, isMutating, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const items = cart?.items || [];
  const summary = cart?.summary || {
    totalItems: 0,
    totalQuantity: 0,
    garmentSubtotal: 0,
    sizeSurchargeSubtotal: 0,
    subtotal: 0,
    totalDiscount: 0,
    finalTotal: 0,
    isMoqSatisfied: true,
    canProceedToCheckout: false,
    warnings: [],
  };

  const handleUpdateQuantity = (item, size, delta) => {
    const updatedBreakdown = item.sizeBreakdown.map((s) => {
      if (s.size === size) {
        const newQty = Math.max(0, s.quantity + delta);
        return { size: s.size, quantity: newQty };
      }
      return { size: s.size, quantity: s.quantity };
    });

    const newTotal = updatedBreakdown.reduce((sum, s) => sum + s.quantity, 0);
    if (newTotal === 0) {
      if (confirm('Total quantity will become 0. Do you want to remove this item from your cart?')) {
        dispatch(removeCartItem(item._id));
      }
      return;
    }

    dispatch(
      updateCartItem({
        itemId: item._id,
        updateData: { sizeBreakdown: updatedBreakdown },
      })
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader size="lg" text="Loading Your Shopping Cart..." />
        <p className="text-xs text-slate-400">Revalidating prices with Raipur Express catalogue</p>
      </div>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-xl">
          <ShoppingCart className="w-12 h-12 text-slate-600" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl font-black text-white">Your Shopping Cart is Empty</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ready to design custom merchandise for your event, business, or group in Raipur? Minimum order quantity is 10 pieces with guaranteed 24-hour express production.
          </p>
        </div>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Custom T-Shirts</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link href="/products" className="hover:text-white flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <span>/</span>
            <span className="text-brand-400 font-medium">Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Customization Shopping Cart
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear your cart?')) {
                dispatch(clearCartItems());
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Warnings & Price Changes Alert Banner */}
      {summary.warnings && summary.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <div className="flex items-center space-x-2 font-bold text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Catalogue Revalidation Updates:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-300/80 space-y-0.5">
            {summary.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Items vs Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const product = item.product || {};
            const isMoqMet = item.totalQuantity >= 10;
            const isAvailable = item.revalidation?.isAvailable !== false;

            return (
              <div
                key={item._id}
                className={`p-5 sm:p-6 rounded-3xl bg-slate-900 border transition-all space-y-5 ${
                  !isAvailable
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : !isMoqMet
                    ? 'border-amber-500/40'
                    : 'border-slate-800'
                }`}
              >
                {/* Product Snapshot & Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                      {product.images?.[0]?.url && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name || 'Custom T-Shirt'}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                          {item.orderType} Customization
                        </span>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: item.selectedColor?.hex }}
                          />
                          <span className="text-[11px] font-medium">{item.selectedColor?.name}</span>
                        </div>
                      </div>

                      <h2 className="text-base font-black text-white hover:text-brand-400 transition-colors">
                        <Link href={`/products/${product.slug || ''}`}>
                          {product.name || 'Customized T-Shirt'}
                        </Link>
                      </h2>

                      <p className="text-xs text-slate-400">
                        Base rate: &#8377;{item.pricing?.basePricePerUnit}/piece &bull; Raipur 24h Express Production
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                    <span className="text-lg font-black text-brand-400">
                      &#8377;{item.pricing?.totalPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (&#8377;{item.pricing?.effectivePricePerPiece}/pc &bull; {item.totalQuantity} pcs)
                    </span>
                  </div>
                </div>

                {/* Size Distribution Controls (Interactive Matrix) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Size Breakdown:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        isMoqMet
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      Total: {item.totalQuantity} pcs {isMoqMet ? '(MOQ Satisfied)' : `(Need ${10 - item.totalQuantity} more)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {item.sizeBreakdown?.map((s) => {
                      const isPlus = PLUS_SIZES.has(s.size);
                      return (
                        <div
                          key={s.size}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold px-1">
                            <span className="text-white">{s.size}</span>
                            {isPlus && (
                              <span className="text-[8px] text-amber-400 bg-amber-400/10 px-1 rounded">
                                +30
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between bg-slate-900 rounded-lg p-0.5 border border-slate-700/60">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, s.size, -1)}
                              disabled={isMutating}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1">{s.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, s.size, 1)}
                              disabled={isMutating}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customization Details (Print Locations & Notes) */}
                <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Print:</span>
                      {item.printLocations?.map((loc, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium"
                        >
                          {loc.replace('_', ' ')}
                        </span>
                      ))}
                    </div>

                    {item.customText && (
                      <p className="text-[11px] text-slate-300">
                        <span className="text-slate-500 font-semibold">Text: </span>
                        &ldquo;{item.customText}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.artworks && item.artworks.length > 0 && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {item.artworks.length} Artwork File Attached
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => dispatch(removeCartItem(item._id))}
                      disabled={isMutating}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Pricing Breakdown & Checkout Preparation CTA (Sticky) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Order Pricing Breakdown
              </h3>
              <Badge variant={summary.isMoqSatisfied ? 'brand' : 'outline'} size="sm">
                {summary.totalQuantity} Pieces
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Garments Subtotal</span>
                <span className="font-semibold text-slate-200">
                  &#8377;{summary.garmentSubtotal?.toLocaleString('en-IN')}
                </span>
              </div>

              {summary.sizeSurchargeSubtotal > 0 && (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>Plus-Size (2XL–4XL) Surcharges</span>
                    <Info className="w-3 h-3 text-amber-400" />
                  </span>
                  <span className="font-semibold text-amber-400">
                    +&#8377;{summary.sizeSurchargeSubtotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Gross Subtotal</span>
                <span className="font-semibold text-slate-200">
                  &#8377;{summary.subtotal?.toLocaleString('en-IN')}
                </span>
              </div>

              {summary.totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <span>Volume Bulk Discount</span>
                  <span>-&#8377;{summary.totalDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <span>Raipur 24-Hour Express Delivery</span>
                  <Clock className="w-3 h-3 text-brand-400" />
                </span>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Final Total Payable:</span>
                  <span className="text-[10px] text-slate-500">Excl. applicable 5% GST</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-400 block">
                    &#8377;{summary.finalTotal?.toLocaleString('en-IN')}
                  </span>
                  {summary.totalQuantity > 0 && (
                    <span className="text-[10px] text-slate-400">
                      &#8377;{Math.round(summary.finalTotal / summary.totalQuantity)}/piece avg
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Raipur 24h Express Delivery Estimator */}
            <DeliveryEstimator
              totalQuantity={summary.totalQuantity}
              initialPincode="492001"
              showQuickPills={false}
            />

            {/* Action: Proceed to Checkout Preparation */}
            <div className="space-y-2">
              <Link
                href={summary.canProceedToCheckout ? '/checkout' : '#'}
                className={`w-full inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-xs font-black tracking-wide transition-all ${
                  summary.canProceedToCheckout
                    ? 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-xl shadow-brand-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                <span>Proceed to Checkout Preparation</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              {!summary.isMoqSatisfied && (
                <p className="text-[11px] text-center text-amber-400 font-semibold">
                  Each customized design requires a minimum of 10 pieces to proceed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
