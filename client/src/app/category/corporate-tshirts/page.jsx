import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Clock, Zap, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

export const metadata = {
  title: 'Corporate T-shirts & Polos — GIFT KRO Raipur',
  description:
    'Custom embroidered collared polo shirts and branded corporate t-shirts for teams, exhibitions, and startups in Raipur. Minimum order: 10 pieces.',
};

const placeholderProducts = [
  {
    _id: 'corp-1',
    name: 'Executive Matty Pique Collar Polo',
    slug: 'executive-matty-collar-polo',
    basePrice: 329,
    description: '220 GSM combed cotton-rich pique knit with precision chest embroidery and rib-knit collar.',
    category: { name: 'Corporate T-shirts', slug: 'corporate-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Navy Blue', hex: '#1e3a8a' },
      { name: 'Graphite Grey', hex: '#374151' },
      { name: 'Classic Black', hex: '#111827' },
      { name: 'Pure White', hex: '#ffffff' },
    ],
  },
  {
    _id: 'corp-2',
    name: 'Tech Startup Premium Crew Uniform Tee',
    slug: 'tech-startup-crew-tee',
    basePrice: 269,
    description: 'Minimalist chest logo print with soft silicone wash finish for software and tech workforces.',
    category: { name: 'Corporate T-shirts', slug: 'corporate-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Charcoal Slate', hex: '#1f2937' },
      { name: 'Deep Indigo', hex: '#312e81' },
    ],
  },
  {
    _id: 'corp-3',
    name: 'Dry-Tech Performance Corporate Polo',
    slug: 'dry-tech-corporate-polo',
    basePrice: 359,
    description: 'Breathable anti-odor poly-cotton knit tailored for field staff, exhibitions, and outdoor corporate events.',
    category: { name: 'Corporate T-shirts', slug: 'corporate-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Steel Blue', hex: '#475569' },
      { name: 'Royal Navy', hex: '#1e3a8a' },
      { name: 'Jet Black', hex: '#111827' },
    ],
  },
];

export default function CorporateTshirtsPage() {
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
        <span className="text-stone-900 font-medium">Corporate T-shirts</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
          <Building2 className="h-3.5 w-3.5" />
          <span>Workplace, Startups & Uniforms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Corporate T-shirts & Polos
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Elevate brand presentation with premium collar polos, custom embroidery, and high-density screen printed uniforms. Official GST invoices and bulk business billing provided.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Zap className="h-4 w-4 text-stone-800" /> Minimum Order Quantity: 10 pieces
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Clock className="h-4 w-4 text-stone-800" /> 24h Raipur Delivery on qualifying orders
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Heavyweight Matty & Combed Cotton
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <section className="space-y-6">
        <SectionHeading
          tag="Corporate Uniforms"
          title="Branded Polos & Workwear"
          description="Durable collar shirts with embroidery and screen printing options."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Bulk Order Disclaimer */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h3 className="text-sm font-bold text-stone-900">Corporate Minimums & Invoicing</h3>
        <p leading-relaxed>
          Corporate orders require a minimum order quantity of 10 pieces. GST-compliant tax invoices and customized digital mockups are issued upon order review. Fast 24-hour dispatch applies only to eligible Raipur service zones under standard operational conditions.
        </p>
      </div>
    </div>
  );
}
