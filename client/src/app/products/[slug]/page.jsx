'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Send,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Layers,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { fetchProductBySlug, clearSelectedProduct } from '@/redux/slices/productSlice.js';
import { openModal } from '@/redux/slices/uiSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { DeliveryEstimator } from '@/components/delivery/DeliveryEstimator.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { selectedProduct: product, relatedProducts, isDetailsLoading, error } = useAppSelector(
    (state) => state.products
  );

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, slug]);

  // Set default size and color when product loads
  useEffect(() => {
    if (product) {
      if (product.availableSizes && product.availableSizes.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      }
      if (product.availableColors && product.availableColors.length > 0) {
        setSelectedColor(product.availableColors[0]);
      }
      setActiveImageIndex(0);
    }
  }, [product]);

  if (isDetailsLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size="lg" text="Loading product specifications..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12">
        <ErrorState
          title="Product Not Found"
          description={error || "We couldn't find the requested custom apparel item in our Raipur catalog."}
          actionText="Back to Catalogue"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', alt: product.name }
  ];

  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">
          Custom T-Shirts
        </Link>
        <span>/</span>
        {product.category?.name && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-white transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-200 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden glass-card border border-slate-800 shadow-2xl bg-slate-950">
            <Image
              src={currentImage.url}
              alt={currentImage.alt || product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isExpressEligible && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-xl">
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> 24-Hour Raipur Dispatch
                </span>
              )}
              {product.category?.name && (
                <Badge variant="outline" size="sm" className="bg-slate-950/80 backdrop-blur-md self-start">
                  {product.category.name}
                </Badge>
              )}
            </div>

            <div className="absolute bottom-4 left-4 text-xs font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>MOQ: {product.minOrderQuantity || 10} Pieces</span>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-brand-500 shadow-lg shadow-brand-500/20 scale-105'
                      : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Customization Options (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
              <Layers className="h-4 w-4" />
              <span>{product.category?.name || 'Custom Apparel'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing & Bulk Savings */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-white">&#8377;{product.basePrice}</span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-sm font-medium text-slate-500 line-through">
                  &#8377;{product.compareAtPrice}
                </span>
              )}
              <span className="text-xs text-slate-400">per piece (excl. 5% GST)</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Bulk pricing tier: Tier discounts automatically apply for orders 25+ and 50+ pcs</span>
            </p>
          </div>

          {/* Raipur 24h Express Delivery Eligibility Checker */}
          <DeliveryEstimator totalQuantity={10} initialPincode="492001" />

          {/* Color Selector */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">Select Fabric Color:</span>
                <span className="text-brand-400 font-medium">{selectedColor?.name || 'Choose'}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.availableColors.map((color, idx) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-700 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">Available Sizes (Unisex):</span>
                <span className="text-slate-400 text-[11px]">Mix sizes in bulk order</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-[2.5rem] px-3 rounded-xl text-xs font-bold font-mono transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-3">
            <Link
              href={`/products/${product.slug}/customize`}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-sm font-black bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Customize T-Shirt & Calculate Bulk Price (MOQ 10 pcs)</span>
            </Link>

            <Button
              onClick={() => dispatch(openModal({ modalName: 'quoteModal' }))}
              variant="outline"
              size="lg"
              leftIcon={<Send className="h-4 w-4" />}
              className="w-full justify-center text-xs border-slate-700 hover:border-slate-600"
            >
              Quick Inquiry / Request Callback
            </Button>


            <a
              href="tel:+917710000000"
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>Call Raipur Express Hub: +91 771-000-0000</span>
            </a>
          </div>

          {/* Specifications Table */}
          {product.specifications && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Manufacturing & Printing Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Fabric Quality:</span>
                  <span className="font-semibold text-slate-200">{product.specifications.fabric}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Fabric Weight:</span>
                  <span className="font-semibold text-slate-200">{product.specifications.gsm} GSM</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Printing Technique:</span>
                  <span className="font-semibold text-slate-200">{product.specifications.printTechnique}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Fit Type:</span>
                  <span className="font-semibold text-slate-200">{product.specifications.fit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Category Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">More in {product.category?.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore alternative styles and cuts printed in our Raipur hub
              </p>
            </div>
            <Link href={`/products?category=${product.category?.slug}`} className="text-xs font-semibold text-brand-400 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relImage = rel.images?.[0]?.url || '/images/placeholder-tshirt.jpg';
              return (
                <div
                  key={rel._id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                    <Image
                      src={relImage}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <Link href={`/products/${rel.slug}`} className="block">
                      <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                        {rel.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="font-black text-white">&#8377;{rel.basePrice}</span>
                      <Link href={`/products/${rel.slug}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
