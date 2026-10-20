'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Package,
  Layers,
  Truck,
  Users,
  Building,
  Clock,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
  History,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { logoutUser } from '@/redux/slices/authSlice.js';
import { fetchMetrics, fetchAuditLogs } from '@/redux/slices/adminSlice.js';
import {
  fetchAdminOrders,
  updateOrderStatusAdmin,
  updateArtworkStatusAdmin,
} from '@/redux/slices/orderSlice.js';
import { productService } from '@/services/productService.js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.jsx';
import { AdminDeliveryManager } from '@/components/delivery/AdminDeliveryManager.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Loader } from '@/components/ui/Loader.jsx';

// Allowed order status transitions
const VALID_ORDER_STATUS_TRANSITIONS = {
  pending_payment: ['confirmed', 'payment_failed', 'cancelled'],
  payment_failed: ['pending_payment', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['quality_check', 'cancelled'],
  quality_check: ['dispatched', 'in_production'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  payment_failed: 'Payment Failed',
  confirmed: 'Confirmed',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function AdminDashboardContent() {
  const dispatch = useAppDispatch();
  const { metrics, auditLogs, isLoadingMetrics, isLoadingAudit } = useAppSelector(
    (state) => state.admin
  );
  const { adminOrders, adminPagination, isLoading: isOrdersLoading, isMutating } = useAppSelector(
    (state) => state.orders
  );

  const [activeTab, setActiveTab] = useState('overview'); // overview | orders | artworks | products | delivery | audit
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateModalOrder, setStatusUpdateModalOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [transitionError, setTransitionError] = useState('');

  // Artwork Review Modal
  const [reviewArtworkModal, setReviewArtworkModal] = useState(null);
  const [artworkApprovalChoice, setArtworkApprovalChoice] = useState('approved');
  const [artworkReviewNotes, setArtworkReviewNotes] = useState('');

  // Product Management
  const [productsList, setProductsList] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'customized-t-shirts',
    basePrice: 299,
    minOrderQuantity: 10,
    shortDescription: 'Premium 100% combed cotton custom printed t-shirt.',
  });

  // Notification Banner
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await productService.getProducts({ limit: 50 });
      setProductsList(res.products || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const loadAllData = useCallback(() => {
    dispatch(fetchMetrics());
    dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
    dispatch(
      fetchAdminOrders({
        page: 1,
        limit: 15,
      })
    );
    loadProducts();
  }, [dispatch, loadProducts]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sync order filters
  useEffect(() => {
    dispatch(
      fetchAdminOrders({
        page: orderPage,
        limit: 15,
        status: orderStatusFilter === 'all' ? undefined : orderStatusFilter,
        search: orderSearch || undefined,
      })
    );
  }, [dispatch, orderPage, orderStatusFilter, orderSearch]);

  // Handle Order Status Update with Transition Rules
  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    setTransitionError('');

    if (!nextStatus) {
      setTransitionError('Please select a valid transition status');
      return;
    }

    try {
      await dispatch(
        updateOrderStatusAdmin({
          id: statusUpdateModalOrder._id,
          updateData: {
            orderStatus: nextStatus,
            comment: statusComment,
          },
        })
      ).unwrap();

      showFeedback(`Order #${statusUpdateModalOrder.orderNumber} transitioned to ${nextStatus}!`);
      setStatusUpdateModalOrder(null);
      setNextStatus('');
      setStatusComment('');
      dispatch(fetchMetrics());
      dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
    } catch (err) {
      setTransitionError(err || 'Failed to update order status');
    }
  };

  // Handle Artwork Review Submission
  const handleConfirmArtworkReview = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateArtworkStatusAdmin({
          orderId: reviewArtworkModal.orderId,
          itemId: reviewArtworkModal.itemId,
          artworkId: reviewArtworkModal.artwork._id,
          reviewData: {
            approvalStatus: artworkApprovalChoice,
            reviewNotes: artworkReviewNotes,
          },
        })
      ).unwrap();

      showFeedback(`Artwork "${reviewArtworkModal.artwork.originalName}" marked as ${artworkApprovalChoice}!`);
      setReviewArtworkModal(null);
      setArtworkReviewNotes('');
      dispatch(fetchMetrics());
      dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
    } catch (err) {
      alert(`Error updating artwork: ${err}`);
    }
  };

  // Product Toggle Status
  const handleToggleProductStatus = async (productId) => {
    setActionLoadingId(productId);
    try {
      await productService.toggleProductStatus(productId);
      setProductsList((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isActive: !p.isActive } : p))
      );
      showFeedback('Product status updated successfully!');
      dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
      dispatch(fetchMetrics());
    } catch (err) {
      alert(`Error updating product: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Product Archive
  const handleArchiveProduct = async (productId, name) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await productService.archiveProduct(productId);
      setProductsList((prev) => prev.filter((p) => p._id !== productId));
      showFeedback(`Product "${name}" archived successfully!`);
      dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
      dispatch(fetchMetrics());
    } catch (err) {
      alert(`Error archiving product: ${err.message}`);
    }
  };

  // Create Product Form
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const slug = newProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = await productService.createProduct({
        ...newProductForm,
        slug,
        category: newProductForm.category,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            alt: newProductForm.name,
            isPrimary: true,
          },
        ],
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: [
          { name: 'Jet Black', hex: '#111827' },
          { name: 'Pure White', hex: '#ffffff' },
          { name: 'Navy Blue', hex: '#1e3a8a' },
        ],
      });
      setProductsList((prev) => [created, ...prev]);
      setShowAddProductModal(false);
      showFeedback(`Product "${created.name}" created successfully!`);
      dispatch(fetchAuditLogs({ page: 1, limit: 20 }));
      dispatch(fetchMetrics());
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  };

  // Extract all artworks across active orders for dedicated artwork review tab
  const allArtworksFeed = useMemo(() => {
    const list = [];
    adminOrders.forEach((ord) => {
      ord.items?.forEach((item) => {
        item.artworks?.forEach((art) => {
          list.push({
            orderId: ord._id,
            orderNumber: ord.orderNumber,
            orderStatus: ord.orderStatus,
            customerName: ord.contact?.name,
            customerPhone: ord.contact?.phone,
            itemId: item._id,
            productName: item.name,
            color: item.selectedColor?.name,
            artwork: art,
            createdAt: ord.createdAt,
          });
        });
      });
    });
    return list;
  }, [adminOrders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-amber-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-xl shadow-brand-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                GIFT KRO Admin Console
              </h1>
              <Badge variant="brand" size="sm" dot>
                Authorized Admin
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live operational telemetry, order fulfillment & 24-hour express production hub (Raipur)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={loadAllData}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />}
            disabled={isLoadingMetrics}
          >
            Refresh
          </Button>
          <Button
            onClick={() => dispatch(logoutUser())}
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="h-3.5 w-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Metrics', icon: TrendingUp },
          { id: 'orders', label: `Orders (${adminPagination.total || 0})`, icon: Package },
          { id: 'artworks', label: `Artwork Review (${metrics?.orders?.pendingArtworkCount || 0})`, icon: FileText },
          { id: 'products', label: `Products (${productsList.length})`, icon: Layers },
          { id: 'delivery', label: 'Raipur Express Delivery & Cut-Off', icon: Truck },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & REAL DATABASE METRICS
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key KPI Cards from Real DB Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Captured Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                ₹{(metrics?.financial?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>Verified payments</span> &bull; <span>Avg ₹{metrics?.financial?.avgOrderValue || 0}/order</span>
              </p>
            </div>

            {/* Total Orders */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Total Orders</span>
                <Package className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {metrics?.orders?.totalOrders || 0}
              </div>
              <p className="text-[11px] text-slate-400">
                {metrics?.orders?.totalGarmentsProduced || 0} custom t-shirts in queue
              </p>
            </div>

            {/* 24-Hour Express Orders */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Raipur 24h Express Orders</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {metrics?.orders?.express24hCount || 0}
              </div>
              <p className="text-[11px] text-amber-400/90">
                24-Hour Express Guaranteed SLA
              </p>
            </div>

            {/* Pending Artwork Reviews */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Pending Artwork Approvals</span>
                <FileText className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-400 font-mono">
                {metrics?.orders?.pendingArtworkCount || 0}
              </div>
              <p className="text-[11px] text-slate-400">
                Customer files requiring pre-press review
              </p>
            </div>
          </div>

          {/* Status Breakdown Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              <span>Real Order Pipeline Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {Object.entries(metrics?.orders?.statusBreakdown || {}).map(([st, count]) => (
                <div
                  key={st}
                  onClick={() => {
                    setOrderStatusFilter(st);
                    setActiveTab('orders');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-brand-500/40 cursor-pointer transition-all space-y-1"
                >
                  <span className="text-[10px] text-slate-500 uppercase font-bold block truncate">
                    {ORDER_STATUS_LABELS[st] || st}
                  </span>
                  <span className="text-xl font-black text-white font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operations Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Latest Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-brand-400 hover:text-brand-300 font-bold"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {(metrics?.recentOrders || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No orders created yet.</p>
                ) : (
                  metrics.recentOrders.map((ord) => (
                    <div
                      key={ord._id}
                      onClick={() => {
                        setSelectedOrder(ord);
                      }}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {ord.contact?.name} &bull; {ord.contact?.phone}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-400 block font-mono">
                          ₹{ord.pricingSummary?.finalTotal?.toLocaleString('en-IN')}
                        </span>
                        <Badge size="sm" variant={ord.orderStatus === 'delivered' ? 'success' : 'outline'}>
                          {ord.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Audit Trail */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Administrative Audit Logs
                </h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs text-brand-400 hover:text-brand-300 font-bold"
                >
                  Full Trail &rarr;
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {(metrics?.recentAuditLogs || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No audit records yet.</p>
                ) : (
                  metrics.recentAuditLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-brand-400 font-mono">{log.action}</span>
                        <span className="text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        <span className="text-slate-400">{log.adminEmail}</span> on{' '}
                        <span className="font-semibold text-white">{log.targetEntity}</span> #{log.targetId}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ORDER MANAGEMENT & STATUS TRANSITION MACHINE
         ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls: Search & Status Filter */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search Order #, Coordinator, Phone, Pincode..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-slate-400 font-semibold shrink-0">Filter Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Orders</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="quality_check">Quality Check</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {isOrdersLoading ? (
              <div className="p-16 flex justify-center">
                <Loader size="md" text="Loading customer orders..." />
              </div>
            ) : adminOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Package className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-semibold text-white">No orders matching this criteria</p>
                <p className="text-xs">Adjust your search query or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Order Number</th>
                      <th className="py-3.5 px-4 font-semibold">Customer / Org</th>
                      <th className="py-3.5 px-4 font-semibold">Quantity</th>
                      <th className="py-3.5 px-4 font-semibold">Amount</th>
                      <th className="py-3.5 px-4 font-semibold">Raipur SLA</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {adminOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {ord.orderNumber}
                          <span className="text-[10px] text-slate-500 block font-sans">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-200 block">{ord.contact?.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {ord.contact?.phone} {ord.contact?.organization && `• ${ord.contact.organization}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {ord.pricingSummary?.totalQuantity} pcs
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-brand-400">
                          ₹{ord.pricingSummary?.finalTotal?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.deliveryEstimate?.is24hEligible ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              24h Express
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Standard
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 block">
                            {ord.shippingAddress?.areaLocality}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
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
                            {ORDER_STATUS_LABELS[ord.orderStatus] || ord.orderStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(ord)}
                            className="text-[11px] px-2.5 py-1"
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setStatusUpdateModalOrder(ord);
                              setNextStatus(VALID_ORDER_STATUS_TRANSITIONS[ord.orderStatus]?.[0] || '');
                              setStatusComment('');
                              setTransitionError('');
                            }}
                            className="text-[11px] px-2.5 py-1"
                          >
                            Status
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {adminPagination.totalPages > 1 && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Page {adminPagination.page} of {adminPagination.totalPages} ({adminPagination.total} total)
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={orderPage >= adminPagination.totalPages}
                    onClick={() => setOrderPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ARTWORK & DESIGN PROOF REVIEW
         ========================================================================= */}
      {activeTab === 'artworks' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pre-Press Artwork & Graphic Review
              </h3>
              <p className="text-xs text-slate-400">
                Inspect customer uploaded logos and graphics for resolution, color separation, and screen preparation
              </p>
            </div>
            <Badge variant="brand" size="sm">
              {allArtworksFeed.length} Total Files
            </Badge>
          </div>

          {allArtworksFeed.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-semibold text-white">No uploaded artwork files found</p>
              <p className="text-xs">Artworks attached to custom orders will appear here for review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allArtworksFeed.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-400">
                        {item.orderNumber}
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          item.artwork.approvalStatus === 'approved'
                            ? 'success'
                            : item.artwork.approvalStatus === 'revision_requested'
                            ? 'danger'
                            : 'outline'
                        }
                      >
                        {item.artwork.approvalStatus}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-brand-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-white text-xs block truncate">
                          {item.artwork.originalName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {(item.artwork.size / 1024).toFixed(1)} KB &bull; {item.productName} ({item.color})
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p>Customer: <span className="text-white font-medium">{item.customerName}</span> ({item.customerPhone})</p>
                      {item.artwork.reviewNotes && (
                        <p className="text-amber-400 text-[11px] pt-1">
                          Note: {item.artwork.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <a
                      href={item.artwork.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </a>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setReviewArtworkModal(item);
                        setArtworkApprovalChoice(item.artwork.approvalStatus === 'approved' ? 'approved' : 'approved');
                        setArtworkReviewNotes(item.artwork.reviewNotes || '');
                      }}
                      className="flex-1 text-xs"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: PRODUCT & CATEGORY MANAGEMENT
         ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Custom Apparel Catalogue Management
              </h3>
              <p className="text-xs text-slate-400">
                Maintain products, base prices, active availability, and minimum order quantities
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddProductModal(true)}
            >
              Add New Product
            </Button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {isLoadingProducts ? (
              <div className="p-16 flex justify-center">
                <Loader size="md" text="Loading product catalogue..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product Name</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Base Price</th>
                      <th className="py-3 px-4 font-semibold">MOQ</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {productsList.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {prod.name}
                          <span className="text-[10px] text-slate-500 block font-mono">
                            /{prod.slug}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{prod.category?.name || prod.category || 'T-Shirt'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-brand-400">
                          ₹{prod.basePrice}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {prod.minOrderQuantity || 10} pcs
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(prod._id)}
                            disabled={actionLoadingId === prod._id}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                              prod.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {prod.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <Link href={`/products/${prod.slug}`}>
                            <Button size="sm" variant="outline" className="text-[10px] px-2 py-1">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleArchiveProduct(prod._id, prod.name)}
                            className="text-[10px] px-2 py-1"
                          >
                            Archive
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: RAIPUR EXPRESS DELIVERY & CUT-OFF
         ========================================================================= */}
      {activeTab === 'delivery' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Raipur Service Area & 24h Express Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Maintain serviceable postal codes, cutoff times, and single-batch capacity thresholds
            </p>
          </div>
          <AdminDeliveryManager />
        </div>
      )}

      {/* =========================================================================
          TAB 6: ADMINISTRATIVE AUDIT TRAIL
         ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Administrative Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                Security log tracking all administrative state transitions, pricing changes, and zone modifications
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch(fetchAuditLogs({ page: 1, limit: 20 }))}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Logs
            </Button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            {isLoadingAudit ? (
              <div className="p-16 flex justify-center">
                <Loader size="md" text="Loading audit trail..." />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No audit log entries recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                      <th className="py-3.5 px-4 font-semibold">Action</th>
                      <th className="py-3.5 px-4 font-semibold">Administrator</th>
                      <th className="py-3.5 px-4 font-semibold">Entity</th>
                      <th className="py-3.5 px-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-400">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {log.adminEmail}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-semibold">{log.targetEntity}</span> #{String(log.targetId).slice(-6)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ORDER DETAILS DRAWER / MODAL
         ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coordinator & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Coordinator Contact
                </span>
                <p className="font-semibold text-white">{selectedOrder.contact?.name}</p>
                <p className="text-slate-400">{selectedOrder.contact?.email}</p>
                <p className="text-slate-400">{selectedOrder.contact?.phone}</p>
                {selectedOrder.contact?.organization && (
                  <p className="text-brand-400 font-medium">Org: {selectedOrder.contact.organization}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Raipur Delivery Address
                </span>
                <p className="font-semibold text-white">{selectedOrder.shippingAddress?.streetAddress}</p>
                <p className="text-slate-400">
                  {selectedOrder.shippingAddress?.areaLocality}, {selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.pincode}
                </p>
                <p className="text-emerald-400 font-medium">
                  {selectedOrder.deliveryEstimate?.is24hEligible ? '24h Express Hub Delivery' : 'Standard Courier Transit'}
                </p>
              </div>
            </div>

            {/* Garment Configurations */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Items ({selectedOrder.pricingSummary?.totalQuantity} pcs):
              </span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">{item.name} ({item.selectedColor?.name})</span>
                    <span className="text-brand-400 font-mono">₹{item.pricing?.totalPrice}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {item.sizeBreakdown?.map((s, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
                        {s.size}: {s.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Status History */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Transition History
              </span>
              <div className="space-y-1.5 text-[11px]">
                {selectedOrder.statusHistory?.map((hist, hIdx) => (
                  <div key={hIdx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-brand-400 uppercase">{hist.status}</span> &bull;{' '}
                      <span className="text-slate-400">{hist.comment || hist.changedByName}</span>
                    </div>
                    <span className="text-slate-500 font-mono">
                      {new Date(hist.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ORDER STATUS UPDATE (WITH TRANSITION RULES ENFORCEMENT)
         ========================================================================= */}
      {statusUpdateModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">
                Update Order Status: #{statusUpdateModalOrder.orderNumber}
              </h3>
              <button
                onClick={() => setStatusUpdateModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusUpdate} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                <Badge variant="brand" size="sm">
                  {statusUpdateModalOrder.orderStatus}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Select Allowed Next Status:
                </label>
                {VALID_ORDER_STATUS_TRANSITIONS[statusUpdateModalOrder.orderStatus]?.length === 0 ? (
                  <p className="text-amber-400 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    This order is in a terminal status ({statusUpdateModalOrder.orderStatus}). No further transitions allowed.
                  </p>
                ) : (
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 font-semibold"
                  >
                    {VALID_ORDER_STATUS_TRANSITIONS[statusUpdateModalOrder.orderStatus]?.map((st) => (
                      <option key={st} value={st}>
                        {ORDER_STATUS_LABELS[st] || st}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Transition Comment / Reason:
                </label>
                <textarea
                  rows="2"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="e.g. Garments passed curing check; handed to local delivery fleet"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {transitionError && (
                <p className="text-rose-400 text-[11px] font-semibold">{transitionError}</p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setStatusUpdateModalOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isMutating || VALID_ORDER_STATUS_TRANSITIONS[statusUpdateModalOrder.orderStatus]?.length === 0}
                >
                  {isMutating ? 'Updating...' : 'Confirm Transition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ARTWORK APPROVAL / REVISION
         ========================================================================= */}
      {reviewArtworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">
                Review Artwork File
              </h3>
              <button
                onClick={() => setReviewArtworkModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmArtworkReview} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block truncate">
                  {reviewArtworkModal.artwork.originalName}
                </span>
                <span className="text-slate-400">
                  Order #{reviewArtworkModal.orderNumber} &bull; {reviewArtworkModal.customerName}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Approval Decision:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setArtworkApprovalChoice('approved')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      artworkApprovalChoice === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✓ Approve File
                  </button>
                  <button
                    type="button"
                    onClick={() => setArtworkApprovalChoice('revision_requested')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      artworkApprovalChoice === 'revision_requested'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    ⚠ Request Revision
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Reviewer Notes / Instructions:
                </label>
                <textarea
                  rows="2"
                  value={artworkReviewNotes}
                  onChange={(e) => setArtworkReviewNotes(e.target.value)}
                  placeholder="e.g. High resolution verified; ready for DTF heat press"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setReviewArtworkModal(null)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD NEW PRODUCT
         ========================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">Create New Custom Apparel Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Premium Bio-Washed Cotton Crew Neck"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newProductForm.basePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Minimum Order Quantity</label>
                  <input
                    type="number"
                    min="10"
                    value={newProductForm.minOrderQuantity}
                    onChange={(e) => setNewProductForm({ ...newProductForm, minOrderQuantity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Category</label>
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="customized-t-shirts">Customized T-shirts</option>
                  <option value="event-t-shirts">Event T-shirts</option>
                  <option value="group-t-shirts">Group T-shirts</option>
                  <option value="corporate-t-shirts">Corporate T-shirts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Short Description</label>
                <textarea
                  rows="2"
                  value={newProductForm.shortDescription}
                  onChange={(e) => setNewProductForm({ ...newProductForm, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
