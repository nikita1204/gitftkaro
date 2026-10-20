import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

export const metadata = {
  title: 'Customized T-shirts — GIFT KRO Raipur',
  description:
    'Custom printed T-shirts for personal branding and creative gifts in Raipur. Screen & DTF prints on 100% bio-washed cotton. Minimum order: 10 pieces.',
};

const placeholderProducts = [
  {
    _id: 'cust-1',
    name: 'Classic Crew Neck Custom T-Shirt',
    slug: 'classic-crew-neck-tshirt',
    basePrice: 249,
    description: '180 GSM super-combed bio-washed cotton with high-density full color DTF print.',
    category: { name: 'Customized T-shirts', slug: 'customized-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Black', hex: '#111827' },
      { name: 'White', hex: '#f9fafb' },
      { name: 'Navy', hex: '#1e3a8a' },
      { name: 'Maroon', hex: '#831843' },
    ],
  },
  {
    _id: 'cust-2',
    name: 'Heavyweight Premium Oversized Tee',
    slug: 'oversized-streetwear-tee',
    basePrice: 349,
    description: '240 GSM French terry cotton with drop shoulders and durable chest graphic.',
    category: { name: 'Customized T-shirts', slug: 'customized-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Charcoal', hex: '#374151' },
      { name: 'Beige', hex: '#d6c7b2' },
      { name: 'Olive', hex: '#365314' },
    ],
  },
  {
    _id: 'cust-3',
    name: 'Breathable Performance Poly-Cotton Tee',
    slug: 'performance-active-tee',
    basePrice: 219,
    description: 'Lightweight moisture-wicking blend suited for outdoor printing and daily wear.',
    category: { name: 'Customized T-shirts', slug: 'customized-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Royal Blue', hex: '#2563eb' },
      { name: 'Grey Melange', hex: '#9ca3af' },
      { name: 'Black', hex: '#111827' },
    ],
  },
];

export default function CustomizedTshirtsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900 transition-colors">
          Collections
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-medium">Customized T-shirts</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Core Category</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Customized T-shirts
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Upload artwork, text, or brand assets. Precision printed with high-resolution direct-to-film transfers and traditional screen printing on pre-shrunk combed cotton.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Zap className="h-4 w-4 text-brand-600" /> Minimum Order Quantity: 10 pieces
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Clock className="h-4 w-4 text-brand-600" /> Eligible for 24h Raipur delivery
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Bio-wash finish
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <section className="space-y-6">
        <SectionHeading
          tag="Available Styles"
          title="Custom T-Shirt Catalog Options"
          description="Select a base silhouette to customize with your design proof."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Bulk Order Disclaimer Box */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h3 className="text-sm font-bold text-stone-900">Order Policy & Turnaround Notes</h3>
        <p leading-relaxed>
          Customized apparel orders require a minimum of 10 pieces. 24-hour turnaround is available in designated Raipur postal sectors and depends on prompt artwork validation, size confirmation, and production capacity.
        </p>
      </div>
    </div>
  );
}
