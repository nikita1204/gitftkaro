import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Zap, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

export const metadata = {
  title: 'Event T-shirts — GIFT KRO Raipur',
  description:
    'Custom event merchandise for college fests, sports tournaments, marathons, and cultural celebrations in Raipur. Minimum order: 10 pieces.',
};

const placeholderProducts = [
  {
    _id: 'event-1',
    name: 'College Fest & Marathon Dry-Fit Tee',
    slug: 'college-fest-marathon-tee',
    basePrice: 199,
    description: 'Quick-dry microfiber jersey fabric with vibrant sublimation and screen prints.',
    category: { name: 'Event T-shirts', slug: 'event-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Electric Blue', hex: '#2563eb' },
      { name: 'Neon Green', hex: '#65a30d' },
      { name: 'Fiery Orange', hex: '#ea580c' },
    ],
  },
  {
    _id: 'event-2',
    name: 'Concert & Festival Commemorative Tee',
    slug: 'festival-commemorative-tee',
    basePrice: 259,
    description: '100% Cotton with front & back festival lineup artwork in durable plastisol ink.',
    category: { name: 'Event T-shirts', slug: 'event-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Pitch Black', hex: '#111827' },
      { name: 'Pure White', hex: '#f9fafb' },
    ],
  },
  {
    _id: 'event-3',
    name: 'Sports League & Tournament Jersey Tee',
    slug: 'sports-league-jersey-tee',
    basePrice: 229,
    description: 'Breathable sports mesh with custom player numbers, sponsor emblems, and team crest.',
    category: { name: 'Event T-shirts', slug: 'event-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Crimson Red', hex: '#b91c1c' },
      { name: 'Golden Yellow', hex: '#eab308' },
      { name: 'Navy', hex: '#1e3a8a' },
    ],
  },
];

export default function EventTshirtsPage() {
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
        <span className="text-stone-900 font-medium">Event T-shirts</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
          <Calendar className="h-3.5 w-3.5" />
          <span>Fests, Rallies & Meets</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Event T-shirts
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Outfit your entire team, volunteer corps, or fest attendees. High-speed bulk production with consistent color fidelity and budget-conscious pricing tiers.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Zap className="h-4 w-4 text-amber-600" /> Minimum Order Quantity: 10 pieces
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Clock className="h-4 w-4 text-amber-600" /> Express event turnaround in Raipur
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Wash-resistant prints
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <section className="space-y-6">
        <SectionHeading
          tag="Event Collection"
          title="Popular Event Silhouettes"
          description="Designed for comfort during long festival days and athletic meets."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Bulk Order Disclaimer */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h3 className="text-sm font-bold text-stone-900">Event Timelines & Eligibility</h3>
        <p leading-relaxed>
          Event T-shirt orders require a minimum order quantity of 10 pieces. 24-hour fast delivery is available in designated Raipur zones subject to capacity and early design proof sign-off.
        </p>
      </div>
    </div>
  );
}
