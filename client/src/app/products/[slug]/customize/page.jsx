'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug } from '@/redux/slices/productSlice.js';
import {
  fetchPricingRules,
  calculatePriceQuote,
  uploadArtworkFile,
  submitCustomization,
  removeUploadedArtwork,
  resetCustomizationState,
} from '@/redux/slices/customizationSlice.js';
import { addToCart } from '@/redux/slices/cartSlice.js';
import {
  Sparkles,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Trash2,
  FileText,
  Copy,
  ExternalLink,
  Users,
  Briefcase,
  PartyPopper,
  User,
  Info,
  ShoppingCart,
} from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import Loader from '@/components/ui/Loader.jsx';
import Badge from '@/components/ui/Badge.jsx';
import { DeliveryEstimator } from '@/components/delivery/DeliveryEstimator.jsx';


const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const PLUS_SIZES = new Set(['2XL', '3XL', '4XL']);

const ORDER_TYPES = [
  {
    id: 'group',
    title: 'Group & Friends',
    desc: 'College clubs, reunions, road trips, bachelor squads',
    icon: Users,
    badge: 'Popular',
  },
  {
    id: 'event',
    title: 'Event & Festival',
    desc: 'Marathons, tech conferences, cultural fests, sports',
    icon: PartyPopper,
    badge: 'Express 24h',
  },
  {
    id: 'corporate',
    title: 'Corporate & Startup',
    desc: 'Uniforms, hackathons, team merchandise, onboarding',
    icon: Briefcase,
    badge: 'GST Invoice',
  },
  {
    id: 'individual',
    title: 'Personalized / Milestone',
    desc: 'Family celebrations, anniversaries, special milestones',
    icon: User,
    badge: 'MOQ 10 pcs',
  },
];

const PRINT_LOCATIONS = [
  { id: 'front_chest', label: 'Left Chest Logo', desc: 'Standard breast pocket badge (approx. 3.5" x 3.5")' },
  { id: 'full_front', label: 'Full Front Chest', desc: 'Bold banner or event graphic (approx. 10" x 12")' },
  { id: 'back_top', label: 'Upper Back / Neck', desc: 'Tagline, hashtag, or small sponsor logo' },
  { id: 'full_back', label: 'Full Back Artwork', desc: 'Large event lineup, participant names, or numbers' },
  { id: 'left_sleeve', label: 'Left Sleeve', desc: 'City emblem, year badge, or branch ID' },
  { id: 'right_sleeve', label: 'Right Sleeve', desc: 'Sponsor logo, partner crest, or URL' },
];

export default function CustomizeProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { selectedProduct: currentProduct, isDetailsLoading: isDetailLoading } = useSelector(
    (state) => state.products
  );

  const {
    pricingRules,
    currentQuote,
    isCalculatingQuote,
    calculateError,
    uploadedArtworks,
    isUploadingArtwork,
    uploadError,
    isSubmitting,
    submitSuccess,
    savedCustomization,
    submitError,
  } = useSelector((state) => state.customization);

  // Form State
  const [orderType, setOrderType] = useState('group');
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeQuantities, setSizeQuantities] = useState({
    XS: 0,
    S: 2,
    M: 4,
    L: 4,
    XL: 0,
    '2XL': 0,
    '3XL': 0,
    '4XL': 0,
  });
  const [printLocations, setPrintLocations] = useState(['front_chest']);
  const [customText, setCustomText] = useState('');
  const [printingInstructions, setPrintingInstructions] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product and pricing rules on mount

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    dispatch(fetchPricingRules());
  }, [slug, dispatch]);

  // Set default color when product loads
  useEffect(() => {
    if (currentProduct?.availableColors?.length > 0 && !selectedColor) {
      setSelectedColor(currentProduct.availableColors[0]);
    }
  }, [currentProduct, selectedColor]);

  // Total quantity computed from size matrix
  const totalQuantity = useMemo(() => {
    return Object.values(sizeQuantities).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  }, [sizeQuantities]);

  const minOrderQuantity = pricingRules?.minOrderQuantity || 10;
  const isMoqMet = totalQuantity >= minOrderQuantity;
  const qtyShortfall = Math.max(0, minOrderQuantity - totalQuantity);

  // Trigger server price calculation whenever size distribution or product changes
  const triggerPriceQuote = useCallback(() => {
    if (!currentProduct?._id || !isMoqMet) return;

    const sizeBreakdown = Object.entries(sizeQuantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size, qty]) => ({ size, quantity: Number(qty) }));

    if (sizeBreakdown.length === 0) return;

    dispatch(
      calculatePriceQuote({
        productId: currentProduct._id,
        sizeBreakdown,
        printLocations,
        selectedColor,
      })
    );
  }, [currentProduct?._id, isMoqMet, sizeQuantities, printLocations, selectedColor, dispatch]);

  useEffect(() => {
    triggerPriceQuote();
  }, [triggerPriceQuote]);

  // Handle Size Quantity Change
  const handleSizeChange = (size, value) => {
    const parsed = Math.max(0, parseInt(value, 10) || 0);
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: parsed,
    }));
  };

  const incrementSize = (size) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: (prev[size] || 0) + 1,
    }));
  };

  const decrementSize = (size) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: Math.max(0, (prev[size] || 0) - 1),
    }));
  };

  // Toggle Print Location
  const togglePrintLocation = (id) => {
    setPrintLocations((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // At least one location required
        return prev.filter((loc) => loc !== id);
      }
      return [...prev, id];
    });
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
    const maxBytes = 10 * 1024 * 1024; // 10MB

    const formData = new FormData();
    let hasValidFile = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedMimes.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported format. Please upload PNG, JPG, WEBP, SVG, or PDF.`);
        continue;
      }
      if (file.size > maxBytes) {
        alert(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }
      formData.append('artwork', file);
      hasValidFile = true;
    }

    if (hasValidFile) {
      dispatch(uploadArtworkFile(formData));
    }

    e.target.value = null;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!contactInfo.name.trim()) errors.name = 'Contact name is required';
    if (!contactInfo.email.trim() || !/\S+@\S+\.\S+/.test(contactInfo.email))
      errors.email = 'Valid contact email is required';
    if (!contactInfo.phone.trim() || contactInfo.phone.replace(/\D/g, '').length < 10)
      errors.phone = '10-digit mobile number is required';
    if (!isMoqMet) errors.quantity = `Minimum order quantity is ${minOrderQuantity} pieces`;
    if (printLocations.length === 0) errors.printLocations = 'Select at least one print location';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const sizeBreakdown = Object.entries(sizeQuantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size, qty]) => ({ size, quantity: Number(qty) }));

    const payload = {
      productId: currentProduct._id,
      orderType,
      selectedColor: selectedColor || { name: 'Standard Black', hex: '#111827' },
      sizeBreakdown,
      printLocations,
      customText,
      printingInstructions,
      artworks: uploadedArtworks,
      contactInfo,
    };

    dispatch(submitCustomization(payload));
  };

  const handleAddToCart = async () => {
    if (!isMoqMet) {
      alert(`Minimum order quantity for customized T-shirts is ${minOrderQuantity} pieces. Current total is ${totalQuantity} pieces.`);
      return;
    }

    const sizeBreakdown = Object.entries(sizeQuantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size, qty]) => ({ size, quantity: Number(qty) }));

    const itemData = {
      productId: currentProduct._id,
      orderType,
      selectedColor: selectedColor || { name: 'Standard Black', hex: '#111827' },
      sizeBreakdown,
      printLocations,
      customText,
      printingInstructions,
      artworks: uploadedArtworks,
    };

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart(itemData)).unwrap();
      router.push('/cart');
    } catch (err) {
      alert(err || 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const copyCustomizationCode = () => {

    if (savedCustomization?.customizationCode) {
      navigator.clipboard.writeText(savedCustomization.customizationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  if (isDetailLoading || !currentProduct) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader size="lg" text="Loading Customization Studio..." />
        <p className="text-xs text-slate-400">Setting up Raipur express configuration</p>
      </div>
    );
  }

  // Success View after persistence
  if (submitSuccess && savedCustomization) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Specification Locked & Saved
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Custom Order Quote Generated!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Your 24-hour express production details have been securely logged in our Raipur printing facility.
            </p>
          </div>

          {/* Reference Code Card */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Customization Reference Code
              </span>
              <span className="text-lg font-mono font-black text-brand-400 tracking-wider">
                {savedCustomization.customizationCode}
              </span>
            </div>
            <button
              onClick={copyCustomizationCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              {copiedCode ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Order Snapshot */}
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Garment Style:</span>
              <span className="font-bold text-white">{savedCustomization.productSnapshot.name}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Total Quantity:</span>
              <span className="font-bold text-white">{savedCustomization.totalQuantity} Pieces</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Fabric Color:</span>
              <div className="flex items-center space-x-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-700"
                  style={{ backgroundColor: savedCustomization.selectedColor?.hex }}
                />
                <span className="font-semibold text-slate-200">{savedCustomization.selectedColor?.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Verified Quote Total:</span>
              <span className="text-lg font-black text-emerald-400">
                &#8377;{savedCustomization.pricing?.totalPrice?.toLocaleString('en-IN')}
                <span className="text-[11px] font-normal text-slate-400 ml-1">
                  (&#8377;{savedCustomization.pricing?.effectivePricePerPiece}/pc)
                </span>
              </span>
            </div>
          </div>

          {/* Next Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/customizations/${savedCustomization.customizationCode}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-brand-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>View Full Saved Specification</span>
            </Link>

            <button
              onClick={() => {
                dispatch(resetCustomizationState());
                router.push('/products');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              <span>Explore More Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href={`/products/${currentProduct.slug}`} className="hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product</span>
        </Link>
        <span>/</span>
        <span className="text-brand-400 font-medium">Customization & Bulk Pricing Studio</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
            {currentProduct.images?.[0]?.url && (
              <Image
                src={currentProduct.images[0].url}
                alt={currentProduct.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="brand" size="sm">
                24-Hour Express Production
              </Badge>
              <span className="text-[11px] text-slate-400 font-medium">MOQ: 10 Pieces</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{currentProduct.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Base garment: <span className="font-bold text-white">&#8377;{currentProduct.basePrice}</span>/pc &bull; All print locations included
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl shrink-0">
          <Clock className="w-4 h-4" />
          <span>Raipur Dispatch in 24 Hours Guaranteed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Order Type */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 1</span>
                <h2 className="text-base font-black text-white">Select Order Category</h2>
              </div>
              <span className="text-xs text-slate-400">Tailored printing setup</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ORDER_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = orderType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm text-white">{type.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {type.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Color Picker */}
          {currentProduct.availableColors?.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 2</span>
                  <h2 className="text-base font-black text-white">Choose Garment Fabric Color</h2>
                </div>
                <span className="text-xs font-semibold text-brand-400">{selectedColor?.name}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {currentProduct.availableColors.map((color, idx) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 text-white ring-2 ring-brand-500/40'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Size & Quantity Matrix */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 3</span>
                <h2 className="text-base font-black text-white">Size & Quantity Distribution</h2>
                <p className="text-xs text-slate-400">Mix sizes freely to satisfy minimum 10 pieces</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Total Quantity:</span>
                <span
                  className={`text-base font-black px-3 py-1 rounded-xl ${
                    isMoqMet ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {totalQuantity} pcs
                </span>
              </div>
            </div>

            {/* MOQ Banner Notice */}
            {!isMoqMet ? (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center space-x-3 text-xs text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold block">Minimum Order Quantity is 10 T-shirts</span>
                  <p className="text-[11px] text-amber-300/90">
                    Please add <span className="font-black text-amber-300 underline">{qtyShortfall} more piece(s)</span> across sizes to activate custom printing quote.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>MOQ satisfied ({totalQuantity} pieces selected).</span>
                </div>
                {totalQuantity < 25 && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Add {25 - totalQuantity} more for 5% bulk discount!
                  </span>
                )}
                {totalQuantity >= 25 && totalQuantity < 50 && (
                  <span className="text-[11px] text-brand-400 font-bold">
                    5% bulk discount active! Add {50 - totalQuantity} for 10% wholesale!
                  </span>
                )}
                {totalQuantity >= 50 && totalQuantity < 100 && (
                  <span className="text-[11px] text-brand-400 font-bold">
                    10% wholesale active! Add {100 - totalQuantity} for 15% mega discount!
                  </span>
                )}
                {totalQuantity >= 100 && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Max 15% Mega Bulk Discount Active!
                  </span>
                )}
              </div>
            )}

            {/* Size Breakdown Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_SIZES.map((size) => {
                const isPlus = PLUS_SIZES.has(size);
                const qty = sizeQuantities[size] || 0;
                return (
                  <div
                    key={size}
                    className={`p-3 rounded-2xl border transition-all ${
                      qty > 0
                        ? 'border-brand-500/60 bg-brand-500/5'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-white">{size}</span>
                      {isPlus ? (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                          +&#8377;30/pc
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-medium">Std Size</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => decrementSize(size)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleSizeChange(size, e.target.value)}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => incrementSize(size)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {formErrors.quantity && (
              <p className="text-xs text-rose-400 font-medium">{formErrors.quantity}</p>
            )}
          </div>

          {/* Step 4: Print Locations */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 4</span>
                <h2 className="text-base font-black text-white">Print Placement Locations</h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                All Locations Included
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRINT_LOCATIONS.map((loc) => {
                const isSelected = printLocations.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => togglePrintLocation(loc.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">{loc.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">{loc.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {formErrors.printLocations && (
              <p className="text-xs text-rose-400 font-medium">{formErrors.printLocations}</p>
            )}
          </div>

          {/* Step 5: Custom Text & Instructions */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div>
              <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 5</span>
              <h2 className="text-base font-black text-white">Custom Text & Printing Instructions</h2>
              <p className="text-xs text-slate-400">Specify slogans, event titles, typography or pantone colors</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Custom Slogan / Team Name / Event Title:
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., Raipur Hackathon 2026 / Department of Tech"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Printing Notes & Specifications (Optional):
                </label>
                <textarea
                  rows="3"
                  value={printingInstructions}
                  onChange={(e) => setPrintingInstructions(e.target.value)}
                  placeholder="e.g. Place logo 2 inches below neckline. Use fluorescent neon yellow print on black fabric."
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Step 6: Artwork Upload */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 6</span>
                <h2 className="text-base font-black text-white">Upload Artwork or Reference Design</h2>
              </div>
              <span className="text-[11px] text-slate-400">Max 10MB (PNG, JPG, SVG, PDF)</span>
            </div>

            {/* Upload Drop Zone */}
            <label className="relative border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/30 hover:bg-slate-950/60 transition-colors">
              <Upload className="w-8 h-8 text-brand-400 mb-2" />
              <span className="text-xs font-bold text-white">Click or drag file to upload artwork</span>
              <span className="text-[10px] text-slate-500 mt-1">High-resolution vector or transparent PNG recommended</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploadingArtwork}
                className="hidden"
              />
            </label>

            {isUploadingArtwork && (
              <div className="flex items-center space-x-2 text-xs text-brand-400 p-2">
                <Loader size="sm" />
                <span>Validating & uploading artwork to secure storage...</span>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
            )}

            {/* Uploaded Artworks List */}
            {uploadedArtworks.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Attached Files ({uploadedArtworks.length}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uploadedArtworks.map((art, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <FileText className="w-5 h-5 text-brand-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-semibold text-white block truncate">
                            {art.originalName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {(art.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(removeUploadedArtwork(art.filename))}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 7: Contact Info */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div>
              <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Step 7</span>
              <h2 className="text-base font-black text-white">Contact & Coordinator Details</h2>
              <p className="text-xs text-slate-400">For mock-up approvals and delivery confirmation in Raipur</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Coordinator Name *</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  placeholder="e.g., Rajesh Patel"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.name && <p className="text-[10px] text-rose-400 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="e.g., rajesh@patel.com"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.email && <p className="text-[10px] text-rose-400 mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                {formErrors.phone && <p className="text-[10px] text-rose-400 mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Organization / College / Team</label>
                <input
                  type="text"
                  value={contactInfo.organization}
                  onChange={(e) => setContactInfo({ ...contactInfo, organization: e.target.value })}
                  placeholder="e.g., Raipur Runners / NIT Raipur"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Price Breakdown (Sticky) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Price Breakdown & Summary
              </h3>
              <Badge variant={isMoqMet ? 'brand' : 'outline'} size="sm">
                {isMoqMet ? 'Verified Server Quote' : 'Draft'}
              </Badge>
            </div>

            {/* Calculations Table */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Garment ({totalQuantity} pcs &times; &#8377;{currentProduct.basePrice})</span>
                <span className="font-semibold text-slate-200">
                  &#8377;{(totalQuantity * currentProduct.basePrice).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Plus Size Surcharges if applicable */}
              {currentQuote?.pricing?.sizeSurchargeSubtotal > 0 && (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>Plus Sizes (2XL–4XL) Surcharge</span>
                    <Info className="w-3 h-3 text-amber-400" />
                  </span>
                  <span className="font-semibold text-amber-400">
                    +&#8377;{currentQuote.pricing.sizeSurchargeSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Gross Subtotal</span>
                <span className="font-semibold text-slate-200">
                  &#8377;{(currentQuote?.pricing?.subtotal || totalQuantity * currentProduct.basePrice).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Volume Discount Tier */}
              {currentQuote?.pricing?.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <div className="space-y-0.5">
                    <span>{currentQuote.pricing.discountTier.label}</span>
                    <span className="text-[10px] text-emerald-300 block font-normal">
                      Volume tier savings applied
                    </span>
                  </div>
                  <span>-&#8377;{currentQuote.pricing.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Total & Effective Price */}
              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Total Payable Estimate:</span>
                  <span className="text-[10px] text-slate-500">Excl. applicable GST</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-400 block">
                    &#8377;
                    {(
                      currentQuote?.pricing?.totalPrice ||
                      totalQuantity * currentProduct.basePrice
                    ).toLocaleString('en-IN')}
                  </span>
                  {totalQuantity > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      &#8377;
                      {currentQuote?.pricing?.effectivePricePerPiece || currentProduct.basePrice}
                      /piece
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Raipur 24h Express Delivery Estimator */}
            <DeliveryEstimator
              totalQuantity={totalQuantity}
              hasArtwork={uploadedArtworks.length > 0}
              initialPincode="492001"
              showQuickPills={false}
            />

            {/* Action Buttons: Add to Cart & Save Quote */}
            <div className="space-y-2.5">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!isMoqMet || isAddingToCart || isCalculatingQuote}
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-xl shadow-brand-500/25 text-xs font-black tracking-wide bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950"
              >
                {isAddingToCart ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    <span>Add to Shopping Cart (MOQ 10 pcs)</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isMoqMet || isSubmitting || isCalculatingQuote}
                variant="outline"
                size="md"
                className="w-full justify-center text-xs font-bold border-slate-700 hover:border-slate-600 text-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    <span>Locking Specification & Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5 text-brand-400" />
                    <span>Save Offline Quote & Get Reference Code</span>
                  </>
                )}
              </Button>

              {!isMoqMet && (
                <p className="text-[11px] text-center text-amber-400 font-semibold">
                  Add {qtyShortfall} more t-shirt(s) to activate cart & checkout (MOQ: 10)
                </p>
              )}

              {submitError && (
                <p className="text-[11px] text-center text-rose-400 font-medium">{submitError}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
