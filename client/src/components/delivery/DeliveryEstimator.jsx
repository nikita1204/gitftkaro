'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Truck,
  Sparkles,
  Search,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import {
  checkDeliveryEligibility,
  fetchServiceablePincodes,
} from '@/redux/slices/deliverySlice.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Loader } from '@/components/ui/Loader.jsx';

// Quick popular Raipur delivery hubs for 1-click test
const POPULAR_RAIPUR_HUBS = [
  { pincode: '492001', area: 'Telibandha & Shankar Nagar' },
  { pincode: '492006', area: 'VIP Road & Airport Area' },
  { pincode: '492009', area: 'Tatibandh & AIIMS Raipur' },
  { pincode: '492014', area: 'Naya Raipur (Atal Nagar)' },
  { pincode: '491001', area: 'Durg / Bhilai (Outside Express)' },
];

export function DeliveryEstimator({
  initialPincode = '',
  totalQuantity = 10,
  hasArtwork = true,
  compact = false,
  showQuickPills = true,
  onEstimateChange,
  className = '',
}) {
  const dispatch = useAppDispatch();
  const { currentEstimate, isChecking, serviceablePincodes } = useAppSelector(
    (state) => state.delivery
  );

  const [pincode, setPincode] = useState(initialPincode || '492001');
  const [qty, setQty] = useState(totalQuantity || 10);
  const [artworkStatus, setArtworkStatus] = useState(hasArtwork);
  const [inputError, setInputError] = useState('');

  // Sync external quantity changes
  useEffect(() => {
    if (totalQuantity) {
      setQty(totalQuantity);
    }
  }, [totalQuantity]);

  // Sync external artwork status
  useEffect(() => {
    setArtworkStatus(hasArtwork);
  }, [hasArtwork]);

  const triggerCheck = React.useCallback(
    async (pin, quantity, artwork) => {
      if (!pin || !/^[1-9][0-9]{5}$/.test(pin)) {
        setInputError('Enter a valid 6-digit postal PIN code (e.g. 492001)');
        return;
      }
      setInputError('');
      try {
        const res = await dispatch(
          checkDeliveryEligibility({
            pincode: pin,
            totalQuantity: Number(quantity) || 10,
            hasArtwork: Boolean(artwork),
          })
        ).unwrap();

        if (onEstimateChange) {
          onEstimateChange(res);
        }
      } catch (err) {
        console.error('Eligibility check error:', err);
      }
    },
    [dispatch, onEstimateChange]
  );

  // Initial check or load serviceable pincodes
  useEffect(() => {
    dispatch(fetchServiceablePincodes());
    if (pincode && /^[1-9][0-9]{5}$/.test(pincode)) {
      triggerCheck(pincode, qty, artworkStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    triggerCheck(pincode, qty, artworkStatus);
  };

  const selectPill = (pin) => {
    setPincode(pin);
    triggerCheck(pin, qty, artworkStatus);
  };

  // Format delivery date nicely
  const formatDeliveryTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
              <span>Raipur 24-Hour Delivery Eligibility</span>
              <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Live estimated dispatch and delivery window for your location
            </p>
          </div>
        </div>

        <Badge variant="brand" size="sm" className="self-start sm:self-auto shrink-0">
          Raipur Express Hub
        </Badge>
      </div>

      {/* Input Box */}
      <form onSubmit={handlePincodeSubmit} className="space-y-3">
        <div className="flex flex-col xs:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPincode(val);
                if (val.length === 6) {
                  triggerCheck(val, qty, artworkStatus);
                }
              }}
              placeholder="Enter 6-digit PIN code (e.g. 492001)"
              maxLength={6}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-black flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 shrink-0"
          >
            {isChecking ? (
              <Loader size="sm" />
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </>
            )}
          </button>
        </div>

        {inputError && <p className="text-[11px] text-rose-400 font-medium">{inputError}</p>}

        {/* Quick Raipur Area Chips */}
        {showQuickPills && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold block">
              Quick Select Raipur Locations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_RAIPUR_HUBS.map((hub) => (
                <button
                  key={hub.pincode}
                  type="button"
                  onClick={() => selectPill(hub.pincode)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    pincode === hub.pincode
                      ? 'bg-brand-500/15 border-brand-500/50 text-brand-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono">{hub.pincode}</span> &bull; {hub.area}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Result Card */}
      {currentEstimate && (
        <div
          className={`p-4 rounded-2xl border transition-all space-y-3 ${
            currentEstimate.is24hEligible
              ? 'bg-emerald-950/25 border-emerald-500/30'
              : currentEstimate.status === 'capacity_exceeded'
              ? 'bg-amber-950/25 border-amber-500/30'
              : currentEstimate.status === 'below_moq'
              ? 'bg-rose-950/25 border-rose-500/30'
              : 'bg-sky-950/25 border-sky-500/30'
          }`}
        >
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              {currentEstimate.is24hEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : currentEstimate.status === 'capacity_exceeded' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : currentEstimate.status === 'below_moq' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Truck className="w-5 h-5 text-sky-400 shrink-0" />
              )}

              <div>
                <span
                  className={`text-xs font-black block ${
                    currentEstimate.is24hEligible
                      ? 'text-emerald-400'
                      : currentEstimate.status === 'capacity_exceeded'
                      ? 'text-amber-400'
                      : currentEstimate.status === 'below_moq'
                      ? 'text-rose-400'
                      : 'text-sky-400'
                  }`}
                >
                  {currentEstimate.is24hEligible
                    ? '24-Hour Express Guaranteed'
                    : currentEstimate.status === 'capacity_exceeded'
                    ? 'Bulk Order Capacity Window: 48–72 Hours'
                    : currentEstimate.status === 'below_moq'
                    ? 'Requires Minimum 10 Pieces'
                    : 'Standard Courier Transit (3–5 Days)'}
                </span>

                <span className="text-[11px] text-slate-300">
                  {currentEstimate.areaName || `PIN Code ${currentEstimate.pincode}`}
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Estimated Delivery:
              </span>
              <span className="text-xs font-black text-white font-mono">
                {currentEstimate.estimatedDeliveryDate
                  ? formatDeliveryTime(currentEstimate.estimatedDeliveryDate)
                  : currentEstimate.estimatedDeliveryWindow}
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentEstimate.explanation || currentEstimate.reason}
          </p>

          {/* Conditions & Operational Rules */}
          {currentEstimate.conditions && currentEstimate.conditions.length > 0 && (
            <div className="pt-1.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fulfillment Conditions:
              </span>
              <ul className="space-y-1">
                {currentEstimate.conditions.map((cond, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-1.5 text-[11px] text-slate-300"
                  >
                    <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hub & Facility badge */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-brand-400" />
              <span>{currentEstimate.hub || 'Raipur Express Facility, Chhattisgarh'}</span>
            </span>
            <span className="font-semibold text-emerald-400">Doorstep Delivery Included</span>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Raipur Local Fleet &bull; 7 Days a Week Service</span>
        </span>
        <span>Orders: 10–100 pcs</span>
      </div>
    </div>
  );
}
