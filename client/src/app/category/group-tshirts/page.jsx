import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, Zap, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

export const metadata = {
  title: 'Group T-shirts — GIFT KRO Raipur',
  description:
    'Custom matching T-shirts for family reunions, travel groups, batchmates, and club trips in Raipur. Minimum order: 10 pieces.',
};

const placeholderProducts = [
  {
    _id: 'group-1',
    name: 'Family Reunion & Trip Cotton Tee',
    slug: 'family-trip-group-tee',
    basePrice: 239,
    description: 'Soft 100% bio-washed cotton with coordinated family tags and vacation destination graphics.',
    category: { name: 'Group T-shirts', slug: 'group-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Sunflower Yellow', hex: '#facc15' },
      { name: 'Sky Blue', hex: '#38bdf8' },
      { name: 'Navy', hex: '#1e3a8a' },
    ],
  },
  {
    _id: 'group-2',
    name: 'Custom Nickname Alumni & Batch Tee',
    slug: 'custom-nickname-batch-tee',
    basePrice: 269,
    description: 'Personalized individual names on the back with shared batch emblem on front chest.',
    category: { name: 'Group T-shirts', slug: 'group-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'Dark Heather Grey', hex: '#4b5563' },
      { name: 'Maroon', hex: '#831843' },
      { name: 'Black', hex: '#111827' },
    ],
  },
  {
    _id: 'group-3',
    name: 'Bachelors & Celebration Crew Tee',
    slug: 'celebration-crew-tee',
    basePrice: 249,
    description: 'Catchy typography designs for wedding squads, bachelor trips, and birthday groups.',
    category: { name: 'Group T-shirts', slug: 'group-tshirts' },
    isExpressEligible: true,
    minOrderQuantity: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        isPrimary: true,
      },
    ],
    availableColors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#111827' },
      { name: 'Dusty Pink', hex: '#f472b6' },
    ],
  },
];

export default function GroupTshirtsPage() {
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
        <span className="text-stone-900 font-medium">Group T-shirts</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Users className="h-3.5 w-3.5" />
          <span>Squads, Trips & Reunions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Group T-shirts
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Celebrate milestones, group vacations, and annual get-togethers. Mix sizes from XS to 3XL across the same design order with custom individual names.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Zap className="h-4 w-4 text-emerald-600" /> Minimum Order Quantity: 10 pieces
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <Clock className="h-4 w-4 text-emerald-600" /> 24h Raipur Delivery Eligible
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pre-shrunk 100% Cotton
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <section className="space-y-6">
        <SectionHeading
          tag="Group Lineup"
          title="Matching Styles For Teams"
          description="Unisex cuts with flexible size distributions starting at 10 pieces."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Group Order Policy */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h3 className="text-sm font-bold text-stone-900">Minimum Quantity & Order Policy</h3>
        <p leading-relaxed>
          All group T-shirt custom orders require at least 10 pieces. 24-hour delivery is offered in selected Raipur areas when design mockups and size breakdowns are confirmed promptly.
        </p>
      </div>
    </div>
  );
}
