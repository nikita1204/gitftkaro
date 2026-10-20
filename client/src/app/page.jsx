import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Shirt,
  Calendar,
  Users,
  Building2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  PackageCheck,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { ProductCard } from '@/components/products/ProductCard.jsx';
import { QuoteButton } from '@/components/common/QuoteButton.jsx';

export const metadata = {
  title: 'GIFT KRO — Your Ideas. Custom Printed. Delivered Fast.',
  description:
    'Customized T-shirts, Event T-shirts, Group T-shirts, and Corporate T-shirts in Raipur. Minimum order quantity: 10 pieces. 24-hour delivery available in selected Raipur areas subject to eligibility.',
};

// Curated Category Cards
const categories = [
  {
    title: 'Customized T-shirts',
    slug: 'customized-tshirts',
    href: '/category/customized-tshirts',
    icon: <Shirt className="h-5 w-5 text-brand-600" />,
    description: 'Personalized crew necks, streetwear oversized cuts, and creative graphic tees.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    badge: 'Popular',
    moq: '10 Pcs',
  },
  {
    title: 'Event T-shirts',
    slug: 'event-tshirts',
    href: '/category/event-tshirts',
    icon: <Calendar className="h-5 w-5 text-amber-600" />,
    description: 'Dry-fit marathon tees, college fest merchandise, and volunteer uniform apparel.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    badge: 'Bulk Discount',
    moq: '10 Pcs',
  },
  {
    title: 'Group T-shirts',
    slug: 'group-tshirts',
    href: '/category/group-tshirts',
    icon: <Users className="h-5 w-5 text-emerald-600" />,
    description: 'Matching designs for batch reunions, travel clubs, family vacations, and celebrations.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    badge: 'Custom Names',
    moq: '10 Pcs',
  },
  {
    title: 'Corporate T-shirts',
    slug: 'corporate-tshirts',
    href: '/category/corporate-tshirts',
    icon: <Building2 className="h-5 w-5 text-stone-700" />,
    description: 'High-density embroidered collar polos and professional startup team uniforms.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    badge: 'GST Invoicing',
    moq: '10 Pcs',
  },
];

// Development Featured Products with Clearly Identified Base Pricing
const featuredProducts = [
  {
    _id: 'prod-featured-1',
    name: '100% Bio-Wash Combed Cotton Crew Tee',
    slug: 'classic-crew-neck-tshirt',
    basePrice: 249,
    description: '180 GSM pre-shrunk cotton ready for full-color DTF and screen printing.',
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
      { name: 'White', hex: '#ffffff' },
      { name: 'Navy', hex: '#1e3a8a' },
    ],
  },
  {
    _id: 'prod-featured-2',
    name: 'College Fest & Marathon Quick-Dry Tee',
    slug: 'college-fest-marathon-tee',
    basePrice: 199,
    description: 'Lightweight breathable microfiber knit designed for festivals and athletic meets.',
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
      { name: 'Blue', hex: '#2563eb' },
      { name: 'Orange', hex: '#ea580c' },
      { name: 'Green', hex: '#16a34a' },
    ],
  },
  {
    _id: 'prod-featured-3',
    name: 'Custom Nickname Alumni & Reunion Tee',
    slug: 'custom-nickname-batch-tee',
    basePrice: 269,
    description: 'Shared batch front print with optional individual names on the back.',
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
      { name: 'Grey', hex: '#4b5563' },
      { name: 'Maroon', hex: '#831843' },
      { name: 'Black', hex: '#111827' },
    ],
  },
  {
    _id: 'prod-featured-4',
    name: 'Executive Pique Knit Collared Polo',
    slug: 'executive-matty-collar-polo',
    basePrice: 329,
    description: '220 GSM heavyweight pique polo with embroidered company logo on left chest.',
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
      { name: 'Navy', hex: '#1e3a8a' },
      { name: 'Black', hex: '#111827' },
      { name: 'White', hex: '#ffffff' },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* 1. HERO SECTION */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Operational Location Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span>Raipur Custom Printing Workshop</span>
            </div>

            {/* Step 3 Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.12]">
              Your Ideas.{' '}
              <span className="text-brand-500">
                Custom Printed.
              </span>{' '}
              Delivered Fast.
            </h1>

            {/* Supporting Copy */}
            <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
              Customized T-shirts engineered for groups, college fests, corporate teams, and celebration events. High-definition screen & DTF printing on 100% bio-washed cotton with low minimums.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/category/customized-tshirts" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto justify-center font-bold"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Customize Your T-shirts
                </Button>
              </Link>

              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto justify-center font-semibold text-stone-800"
                >
                  Explore Collections
                </Button>
              </Link>
            </div>

            {/* Operational Disclaimer Box */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-stone-800 font-semibold">Raipur Delivery Notice:</strong> 24-hour delivery is available exclusively in selected Raipur operational zones and is subject to eligibility, design proof confirmation, and production conditions. Delivery is not guaranteed for every order.
              </p>
            </div>
          </div>

          {/* Hero Right Visual Apparel Card (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-stone-50 border border-stone-200 p-4 sm:p-5 shadow-sm group">
              {/* Product Visual Container */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
                  alt="Custom Printed T-shirts in Raipur"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                />

                {/* Turnaround Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-stone-800 shadow-xs border border-stone-200 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-brand-500" />
                  <span>Eligible 24h Raipur</span>
                </div>

                {/* MOQ Badge */}
                <div className="absolute bottom-3 right-3 bg-stone-900/90 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md">
                  MOQ: 10 Pieces
                </div>
              </div>

              {/* Garment Details Under Preview */}
              <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900 block text-sm">Bio-Washed Cotton</span>
                  <span className="text-stone-500 text-[11px]">Screen &bull; DTF &bull; Embroidery</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">Base Price</span>
                  <span className="text-base font-black text-stone-900">&#8377;249<span className="text-xs text-stone-500 font-normal">/pc</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST AND VALUE SECTION */}
      <section className="space-y-6">
        <SectionHeading
          tag="Why GIFT KRO"
          title="Custom Printing Built For Bulk & Express Orders"
          description="Reliable turnaround, durable prints, and honest low minimum quantities."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Custom Printing</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Precision direct-to-film (DTF) full color and industrial screen printing that maintains crisp color through repeated washes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Bulk Order Friendly</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tiered pricing built for budget-conscious organizations, student societies, marathon committees, and small businesses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Group & Corporate Wear</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Mix unisex sizes across a single batch. Customize individual member names, titles, and company department emblems.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Eligible Fast Delivery</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              24-hour turnaround available in eligible Raipur sectors with local dispatch, avoiding interstate transit delays.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE CATEGORY CARDS */}
      <section className="space-y-6">
        <SectionHeading
          tag="Collections"
          title="Explore Custom Apparel Categories"
          description="Select a purpose-built category tailored to your group size and occasion."
          actionText="View All Collections"
          actionHref="/products"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-brand-500/30 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Category Image */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-stone-800 shadow-xs border border-stone-200">
                    {cat.badge}
                  </span>
                </div>
              </div>

              {/* Category Text & Action */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-lg bg-stone-100 text-stone-800">
                      {cat.icon}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">
                    MOQ: <strong className="text-stone-800">{cat.moq}</strong>
                  </span>
                  <span className="text-brand-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 STEPS) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
        <SectionHeading
          tag="Simple 4-Step Process"
          title="How Custom Printing Works"
          description="From concept to delivered merchandise with complete transparency at every stage."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-stone-900">Choose your T-shirt</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Select fabric weight (180 GSM cotton, dry-fit polyester, or pique polo) and base color.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-stone-900">Share your design</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Upload your company logo, festival graphic, text slogan, or rough design brief.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-stone-900">Confirm your order</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Review your digital mockup proof, confirm exact size distribution, and approve production.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-stone-900">Receive your customized products</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Carefully printed, cured, individually packed, and delivered to your doorstep in Raipur.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS (REUSABLE PRODUCT CARD COMPONENTS) */}
      <section className="space-y-6">
        <SectionHeading
          tag="Featured Styles"
          title="Popular Base Silhouettes"
          description="Curated garment blanks ready for custom printing. Base prices indicated below for development reference."
          actionText="Full Catalogue"
          actionHref="/products"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. BULK-ORDER CTA (MOQ: 10 PIECES) */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 rounded-3xl p-8 sm:p-12 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold">
            <PackageCheck className="h-3.5 w-3.5" />
            <span>MOQ Policy & Bulk Inquiries</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Planning a Bulk T-shirt Order?
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Applicable customized T-shirt orders require a minimum of <strong>10 pieces</strong>. Need 50, 100, or 500+ tees for your fest, marathon, or corporate workforce? Contact our Raipur printing desk for custom volume pricing and instant mockups.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <QuoteButton
              variant="primary"
              size="lg"
              className="font-bold text-white shadow-sm"
            >
              Request Bulk Quote (MOQ 10)
            </QuoteButton>

            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto justify-center border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700"
              >
                Browse All Apparel
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
