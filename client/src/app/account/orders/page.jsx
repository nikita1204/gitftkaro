'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, ArrowRight, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { fetchMyOrders } from '@/redux/slices/orderSlice.js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Loader } from '@/components/ui/Loader.jsx';

function OrdersContent() {
  const dispatch = useAppDispatch();
  const { myOrders, isLoading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link href="/account" className="hover:text-white flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>My Account</span>
            </Link>
            <span>/</span>
            <span className="text-brand-400 font-medium">Order History</span>
          </div>
          <h1 className="text-2xl font-black text-white">Your Customized Orders</h1>
        </div>

        <Link href="/products">
          <Button size="sm" variant="primary">
            New Custom Order
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-16 flex justify-center">
          <Loader size="md" text="Loading your orders..." />
        </div>
      ) : myOrders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t placed any custom t-shirt orders yet. Create customized apparel for your group, event, or team in Raipur!
            </p>
          </div>
          <div>
            <Link href="/products">
              <Button size="sm" variant="primary">
                Browse Custom T-Shirts
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((ord) => (
            <div
              key={ord._id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white font-mono">{ord.orderNumber}</span>
                    {ord.deliveryEstimate?.is24hEligible && (
                      <Badge variant="brand" size="sm">
                        24h Express
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Placed {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge
                    size="sm"
                    variant={
                      ord.orderStatus === 'delivered'
                        ? 'success'
                        : ord.orderStatus === 'cancelled'
                        ? 'danger'
                        : 'brand'
                    }
                  >
                    {ord.orderStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-base font-black text-brand-400 font-mono">
                    ₹{ord.pricingSummary?.finalTotal?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-1 text-xs text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Items ({ord.pricingSummary?.totalQuantity} pcs total):
                </span>
                <p className="font-medium text-white">
                  {ord.items?.map((i) => `${i.totalQuantity}x ${i.name} (${i.selectedColor?.name})`).join(', ')}
                </p>
                <p className="text-[11px] text-slate-400">
                  Delivering to: {ord.shippingAddress?.areaLocality}, {ord.shippingAddress?.city} ({ord.shippingAddress?.pincode})
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Link href={`/orders/${ord.orderNumber || ord._id}`}>
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Track Order & Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
