'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, prepareCheckoutOrder, clearCheckoutPreparation } from '@/redux/slices/cartSlice.js';
import { orderService } from '@/services/orderService.js';
import {
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Copy,
  Sparkles,
  Phone,
  Mail,
  User,
  Building2,
  Truck,
  CreditCard,
  Info,
} from 'lucide-react';

import Button from '@/components/ui/Button.jsx';
import Badge from '@/components/ui/Badge.jsx';
import Loader from '@/components/ui/Loader.jsx';
import { DeliveryEstimator } from '@/components/delivery/DeliveryEstimator.jsx';

const RAIPUR_LOCALITIES = [
  'Telibandha',
  'Pandri',
  'Shankar Nagar',
  'Tatibandh',
  'VIP Road',
  'Samta Colony',
  'Gudhiyari',
  'Pachpedi Naka',
  'Devendra Nagar',
  'Civil Lines',
  'Mowa',
  'Tagore Nagar',
  'Sundar Nagar',
  'DDU Nagar',
  'Khamardih',
  'Other Raipur Area',
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { cart, isLoading: isCartLoading, isPreparingCheckout, checkoutPreparation, checkoutSuccess, checkoutError } =
    useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Form State
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    streetAddress: '',
    landmark: '',
    areaLocality: 'Telibandha',
    city: 'Raipur',
    state: 'Chhattisgarh',
    pincode: '492001',
    deliveryNotes: '',
    expressPreference: 'standard_24h',
  });

  const [formErrors, setFormErrors] = useState({});
  const [copiedId, setCopiedId] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Load cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setContact((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const items = cart?.items || [];
  const summary = cart?.summary || {};

  const handleValidateAndPrepare = (e) => {
    e.preventDefault();

    const errors = {};
    if (!contact.name.trim() || contact.name.trim().length < 2)
      errors.name = 'Coordinator name must be at least 2 characters';
    if (!contact.email.trim() || !/\S+@\S+\.\S+/.test(contact.email))
      errors.email = 'Valid contact email is required';
    if (!contact.phone.trim() || contact.phone.replace(/\D/g, '').length < 10)
      errors.phone = '10-digit mobile number is required';
    if (!shippingAddress.streetAddress.trim() || shippingAddress.streetAddress.trim().length < 5)
      errors.streetAddress = 'Street / building address must be at least 5 characters';
    if (!shippingAddress.areaLocality) errors.areaLocality = 'Select a Raipur locality';
    if (!/^[1-9][0-9]{5}$/.test(shippingAddress.pincode))
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code (e.g. 492001)';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    dispatch(
      prepareCheckoutOrder({
        contact,
        shippingAddress,
      })
    );
  };

  const copyCheckoutId = () => {
    if (checkoutPreparation?.checkoutId) {
      navigator.clipboard.writeText(checkoutPreparation.checkoutId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const createRes = await orderService.createOrder({
        contact,
        shippingAddress,
        idempotencyKey,
      });

      const orderPayload = createRes.data?.order || createRes.data;
      const razorpayData = createRes.data?.razorpay;

      const isScriptLoaded = await loadRazorpayScript();
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // If official Razorpay is available and merchant key is not placeholder:
      if (
        isScriptLoaded &&
        window.Razorpay &&
        razorpayKeyId &&
        razorpayKeyId !== 'rzp_test_placeholder' &&
        !razorpayKeyId.includes('placeholder')
      ) {
        const options = {
          key: razorpayKeyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency,
          name: 'GIFT KRO Express Raipur',
          description: `Order #${orderPayload.orderNumber} (24h Express)`,
          order_id: razorpayData.orderId,
          prefill: {
            name: contact.name,
            email: contact.email,
            contact: contact.phone,
          },
          theme: {
            color: '#fbbf24',
          },
          handler: async function (response) {
            try {
              await orderService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              dispatch(clearCheckoutPreparation());
              dispatch(fetchCart());
              router.push(`/orders/${orderPayload._id}`);
            } catch (err) {
              setPaymentError(err?.response?.data?.message || 'Payment verification failed');
              setIsProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              orderService.reportPaymentFailure({
                razorpayOrderId: razorpayData.orderId,
                failureReason: 'Customer closed payment window',
              });
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          orderService.reportPaymentFailure({
            razorpayOrderId: razorpayData.orderId,
            failureReason: resp.error.description,
          });
          setPaymentError(resp.error.description);
          setIsProcessingPayment(false);
        });
        rzp.open();
      } else {
        // Dev / test simulation: verify cryptographically via server test endpoint
        const simRes = await orderService.simulateTestPayment(orderPayload._id);
        dispatch(clearCheckoutPreparation());
        dispatch(fetchCart());
        router.push(`/orders/${simRes.data._id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err?.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (isCartLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader size="lg" text="Preparing Checkout Session..." />
        <p className="text-xs text-slate-400">Revalidating cart prices with Raipur hub</p>
      </div>
    );
  }

  // If cart is empty, redirect or prompt
  if (items.length === 0 && !checkoutSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-xs text-slate-400">
          Please add custom t-shirts (MOQ 10 pcs) before proceeding to checkout preparation.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  // Checkout Preparation Success Confirmation Screen
  if (checkoutSuccess && checkoutPreparation) {
    const prep = checkoutPreparation;
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="brand" size="sm">
              Phase 3 Checkout Preparation Complete
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Order Verified & Production Slot Reserved!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              All customized designs, size breakdowns, and Raipur express dispatch windows have been verified.
            </p>
          </div>

          {/* Reference Token */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Checkout Preparation Token
              </span>
              <span className="text-base font-mono font-black text-brand-400">
                {prep.checkoutId}
              </span>
            </div>
            <button
              onClick={copyCheckoutId}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
            >
              {copiedId ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Summary Details */}
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Delivery Address (Raipur Express)
              </span>
              <p className="font-semibold text-white">
                {prep.shippingAddress.streetAddress}
              </p>
              <p className="text-slate-400">
                {prep.shippingAddress.areaLocality}, {prep.shippingAddress.city} - {prep.shippingAddress.pincode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Coordinator Contact
              </span>
              <p className="font-semibold text-white">{prep.contact.name}</p>
              <p className="text-slate-400">{prep.contact.email} &bull; {prep.contact.phone}</p>
            </div>

            <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-slate-400">Total Quantity ({prep.pricingSummary.totalQuantity} pcs):</span>
              <span className="text-lg font-black text-brand-400">
                &#8377;{prep.pricingSummary.finalTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Verified Delivery Timeline Card */}
          {prep.deliveryEstimate && (
            <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-brand-400" />
                  <span className="font-bold text-white">Estimated Delivery Window</span>
                </div>
                <Badge variant={prep.deliveryEstimate.is24hEligible ? 'brand' : 'outline'} size="sm">
                  {prep.deliveryEstimate.is24hEligible ? '24h Express' : 'Standard Delivery'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-brand-400 font-black text-sm">
                  {prep.deliveryEstimate.estimatedDeliveryWindow}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {prep.deliveryEstimate.shippingType}
                </span>
              </div>

              {prep.deliveryEstimate.explanation && (
                <p className="text-[11px] text-slate-300">
                  {prep.deliveryEstimate.explanation}
                </p>
              )}

              {prep.deliveryEstimate.conditions && prep.deliveryEstimate.conditions.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Operational Notes:</span>
                  <ul className="space-y-0.5 text-[11px] text-slate-300">
                    {prep.deliveryEstimate.conditions.map((cond, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Explicit Phase Notice Banner */}
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-slate-300 text-left flex items-start space-x-3">
            <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Ready for 24-Hour Production Scheduling</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your delivery address, contact info, and server-side pricing have been validated. Complete payment via Razorpay to activate Raipur Express production.
              </p>
            </div>
          </div>

          {paymentError && (
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
              <p className="font-bold">Payment Notification:</p>
              <p className="text-[11px] mt-0.5">{paymentError}</p>
            </div>
          )}

          {/* Payment CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleInitiatePayment}
              disabled={isProcessingPayment}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-3.5 shadow-xl shadow-brand-500/20 text-xs font-black tracking-wide"
            >
              {isProcessingPayment ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Pay &#8377;{prep.pricingSummary.finalTotal.toLocaleString('en-IN')} & Confirm Order</span>
                </>
              )}
            </Button>

            <button
              onClick={() => {
                dispatch(clearCheckoutPreparation());
                router.push('/cart');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              <span>Return to Cart Review</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/cart" className="hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <span>/</span>
        <span className="text-brand-400 font-medium">Checkout Preparation</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Delivery Address & Checkout Preparation
        </h1>
        <p className="text-xs text-slate-400">
          Confirm your Raipur delivery address and contact information for 24-hour express production.
        </p>
      </div>

      <form onSubmit={handleValidateAndPrepare} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Customer Contact Details */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <User className="w-5 h-5 text-brand-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Coordinator Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="e.g. Ramesh Agrawal"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.name && <p className="text-[10px] text-rose-400 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.email && <p className="text-[10px] text-rose-400 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">10-Digit Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.phone && <p className="text-[10px] text-rose-400 mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organization / Event Name (Optional)</label>
                <input
                  type="text"
                  value={contact.organization}
                  onChange={(e) => setContact({ ...contact, organization: e.target.value })}
                  placeholder="e.g. Raipur Runners / Tech India Ltd"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address (Raipur Express) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <MapPin className="w-5 h-5 text-brand-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Raipur Delivery Address
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Street Address / Building / Plot *</label>
                <input
                  type="text"
                  value={shippingAddress.streetAddress}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                  placeholder="e.g. Flat 302, Green Park Apartments, Near Magneto Mall"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.streetAddress && (
                  <p className="text-[10px] text-rose-400 mt-1">{formErrors.streetAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Area / Locality in Raipur *</label>
                  <select
                    value={shippingAddress.areaLocality}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, areaLocality: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  >
                    {RAIPUR_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    placeholder="e.g. Opposite Telibandha Lake"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City & State</label>
                  <input
                    type="text"
                    disabled
                    value="Raipur, Chhattisgarh"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800/60 rounded-xl text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    placeholder="e.g. 492001"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  {formErrors.pincode && (
                    <p className="text-[10px] text-rose-400 mt-1">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Special Delivery Notes</label>
                <textarea
                  rows="2"
                  value={shippingAddress.deliveryNotes}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, deliveryNotes: e.target.value })}
                  placeholder="e.g. Leave package with front security desk if unavailable"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verified Delivery Timeline & Eligibility */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <Truck className="w-4 h-4 text-brand-400" />
              <span>3. Verified Delivery Timeline & Eligibility</span>
            </div>
            <DeliveryEstimator
              initialPincode={shippingAddress.pincode}
              totalQuantity={summary.totalQuantity}
              onEstimateChange={(est) => {
                if (est?.pincode && est.pincode !== shippingAddress.pincode) {
                  setShippingAddress((prev) => ({ ...prev, pincode: est.pincode }));
                }
              }}
            />
          </div>
        </div>

        {/* Right Column: Revalidated Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Order Review ({summary.totalQuantity} pcs)
              </h3>
              <Badge variant="brand" size="sm">
                24h Express
              </Badge>
            </div>

            {/* Item Quick List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white block truncate">{item.product?.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.totalQuantity} pcs &bull; {item.selectedColor?.name}
                    </span>
                  </div>
                  <span className="font-bold text-brand-400 shrink-0">
                    &#8377;{item.pricing?.totalPrice?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Table */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span>Garments Subtotal</span>
                <span className="font-semibold text-slate-200">
                  &#8377;{summary.garmentSubtotal?.toLocaleString('en-IN')}
                </span>
              </div>

              {summary.sizeSurchargeSubtotal > 0 && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Plus-Size (2XL–4XL) Surcharges</span>
                  <span className="font-semibold text-amber-400">
                    +&#8377;{summary.sizeSurchargeSubtotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {summary.totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Volume Bulk Discount</span>
                  <span>-&#8377;{summary.totalDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Shipping to Raipur</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Final Total:</span>
                  <span className="text-[10px] text-slate-500">Excl. applicable GST</span>
                </div>
                <span className="text-2xl font-black text-brand-400">
                  &#8377;{summary.finalTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isPreparingCheckout || !summary.canProceedToCheckout}
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-xl shadow-brand-500/20 text-xs font-black tracking-wide"
              >
                {isPreparingCheckout ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    <span>Validating & Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    <span>Confirm & Prepare Checkout</span>
                  </>
                )}
              </Button>

              {checkoutError && (
                <p className="text-[11px] text-center text-rose-400 font-medium">{checkoutError}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
