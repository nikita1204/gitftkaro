'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Copy,
  ArrowLeft,
  Sparkles,
  FileText,
  User,
  Building,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { fetchOrderDetails } from '@/redux/slices/orderSlice.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';

// Visual order progression steps
const ORDER_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', desc: 'Payment verified & slot reserved' },
  { key: 'in_production', label: 'In Production', desc: 'Screen printing & DTF processing' },
  { key: 'quality_check', label: 'Quality Check', desc: 'Garment curing & inspection' },
  { key: 'dispatched', label: 'Dispatched', desc: 'Out for Raipur doorstep delivery' },
  { key: 'delivered', label: 'Delivered', desc: 'Received by coordinator' },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentOrder: order, isLoading, error } = useAppSelector((state) => state.orders);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader size="lg" text="Loading Order Telemetry..." />
        <p className="text-xs text-slate-400">Fetching live status from Raipur facility</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <ErrorState
          title="Order Not Found"
          description={error || "We couldn't locate this order in our system. Please check your order reference number."}
          actionText="Back to Storefront"
          onAction={() => router.push('/')}
        />
      </div>
    );
  }

  // Calculate current progression index
  const statusIndexMap = {
    pending_payment: -1,
    payment_failed: -1,
    confirmed: 0,
    in_production: 1,
    quality_check: 2,
    dispatched: 3,
    delivered: 4,
    cancelled: -2,
  };
  const currentStepIndex = statusIndexMap[order.orderStatus] ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/account/orders" className="hover:text-white">
          Orders
        </Link>
        <span>/</span>
        <span className="text-brand-400 font-medium">{order.orderNumber}</span>
      </div>

      {/* Top Order Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Order #{order.orderNumber}
              </h1>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copy Order Number"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.deliveryEstimate?.is24hEligible && (
              <Badge variant="brand" size="sm" dot>
                24-Hour Express Guaranteed
              </Badge>
            )}
            <Badge
              variant={
                order.orderStatus === 'delivered'
                  ? 'success'
                  : order.orderStatus === 'cancelled' || order.orderStatus === 'payment_failed'
                  ? 'danger'
                  : 'brand'
              }
              size="sm"
            >
              {order.orderStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Visual Fulfillment Tracker */}
        {order.orderStatus === 'cancelled' ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>This order was cancelled. Please contact our Raipur support hub if you require assistance.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Production & Delivery Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-brand-500/15 border-brand-500/50 shadow-lg shadow-brand-500/10'
                        : isPassed
                        ? 'bg-slate-950/80 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span className="text-xs font-black text-white">{step.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Artworks (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customized Apparel Items */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" />
                <span>Custom Garment Specifications ({order.pricingSummary.totalQuantity} pcs)</span>
              </h2>
              <span className="text-xs font-mono text-brand-400 font-bold">
                {order.items.length} Configuration(s)
              </span>
            </div>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400">
                        Color: <span className="text-white font-medium">{item.selectedColor?.name}</span> &bull; Type: <span className="capitalize">{item.orderType}</span>
                      </p>
                    </div>
                    <span className="text-sm font-black text-brand-400">
                      ₹{item.pricing?.totalPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Size Breakdown Pills */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Size Distribution ({item.totalQuantity} pcs):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.sizeBreakdown.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                        >
                          <span className="font-bold text-white">{s.size}:</span> {s.quantity} pcs
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Print Locations & Custom Text */}
                  {(item.printLocations?.length > 0 || item.customText) && (
                    <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400 space-y-1">
                      {item.printLocations?.length > 0 && (
                        <p>
                          <span className="text-slate-500 font-medium">Print Locations:</span>{' '}
                          <span className="text-slate-300">
                            {item.printLocations.map((l) => l.replace('_', ' ')).join(', ')}
                          </span>
                        </p>
                      )}
                      {item.customText && (
                        <p>
                          <span className="text-slate-500 font-medium">Custom Text:</span>{' '}
                          <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            &quot;{item.customText}&quot;
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Uploaded Artworks */}
                  {item.artworks && item.artworks.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Attached Artworks ({item.artworks.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.artworks.map((art, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2 truncate pr-2">
                              <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                              <span className="truncate text-white font-medium">{art.originalName}</span>
                            </div>
                            <Badge
                              variant={
                                art.approvalStatus === 'approved'
                                  ? 'success'
                                  : art.approvalStatus === 'revision_requested'
                                  ? 'danger'
                                  : 'outline'
                              }
                              size="sm"
                            >
                              {art.approvalStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Address Information */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Raipur Delivery Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Delivery Address
                </span>
                <p className="font-semibold text-white">{order.shippingAddress?.streetAddress}</p>
                {order.shippingAddress?.landmark && (
                  <p className="text-slate-400">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p className="text-slate-300 font-medium">
                  {order.shippingAddress?.areaLocality}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                </p>
                <p className="text-slate-500">{order.shippingAddress?.state}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Coordinator Contact
                </span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.contact?.name}</span>
                </p>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.contact?.email}</span>
                </p>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.contact?.phone}</span>
                </p>
                {order.contact?.organization && (
                  <p className="text-brand-400 flex items-center gap-1.5 pt-1">
                    <Building className="w-3.5 h-3.5 text-brand-400" />
                    <span>{order.contact.organization}</span>
                  </p>
                )}
              </div>
            </div>

            {/* SLA & Hub Information */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {order.deliveryEstimate?.shippingType || 'Raipur Doorstep Express'}
                </span>
              </div>
              <span className="font-mono text-brand-400 font-bold">
                {order.deliveryEstimate?.hub}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Payment Summary (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Payment & Invoice Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Garments Subtotal</span>
                <span className="font-semibold text-white">
                  ₹{order.pricingSummary?.garmentSubtotal?.toLocaleString('en-IN')}
                </span>
              </div>

              {order.pricingSummary?.sizeSurchargeSubtotal > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>Plus-Size (2XL–4XL) Surcharges</span>
                  <span>+₹{order.pricingSummary.sizeSurchargeSubtotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {order.pricingSummary?.totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Volume Bulk Discount</span>
                  <span>-₹{order.pricingSummary.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Express Doorstep Delivery</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Total Paid:</span>
                  <span className="text-[10px] text-slate-500">Excl. applicable GST</span>
                </div>
                <span className="text-2xl font-black text-brand-400">
                  ₹{order.pricingSummary?.finalTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold text-white uppercase">
                  {order.payment?.provider || 'Razorpay'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <Badge
                  variant={order.payment?.status === 'captured' ? 'success' : 'outline'}
                  size="sm"
                >
                  {order.payment?.status?.toUpperCase()}
                </Badge>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Payment ID:</span>
                  <span className="font-mono text-slate-300 text-[10px]">
                    {order.payment.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <Link href="/products" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Order More Custom T-Shirts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
