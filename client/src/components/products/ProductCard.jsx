'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Shirt, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    _id,
    name = 'Custom Printed T-Shirt',
    slug = 'custom-t-shirt',
    basePrice = 249,
    description = '100% Combed bio-washed cotton. Screen & DTF print ready.',
    category,
    images = [],
    isExpressEligible = true,
    minOrderQuantity = 10,
    availableColors = [],
  } = product;

  const categoryName = typeof category === 'object' ? category?.name : category || 'Custom Apparel';
  const primaryImage =
    images.find((img) => img.isPrimary)?.url ||
    images[0]?.url ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Product Image Showcase */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <Image
          src={primaryImage}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {isExpressEligible && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-brand-700 shadow-xs border border-brand-200">
              <Clock className="h-3 w-3 mr-1 text-brand-500" /> 24h Raipur Eligible
            </span>
          )}
        </div>

        {/* MOQ Tag on Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs">
            MOQ: {minOrderQuantity} Pcs
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
            {categoryName}
          </span>
          <Link href={`/products/${slug}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="text-sm font-bold text-stone-900 line-clamp-1 mt-0.5">
              {name}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Color Palette Indicators */}
        {availableColors && availableColors.length > 0 && (
          <div className="flex items-center space-x-1 pt-1">
            <span className="text-[10px] text-stone-400 mr-1">Colors:</span>
            {availableColors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                className="h-3 w-3 rounded-full border border-stone-300 shadow-2xs"
                style={{ backgroundColor: color.hex || '#000000' }}
                title={color.name || 'Color'}
              />
            ))}
            {availableColors.length > 5 && (
              <span className="text-[10px] text-stone-400">+{availableColors.length - 5}</span>
            )}
          </div>
        )}

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400">Starting from</div>
            <div className="text-base font-black text-stone-900">
              &#8377;{basePrice}
              <span className="text-[10px] text-stone-500 font-normal"> / pc</span>
            </div>
          </div>

          <Link href={`/products/${slug}`}>
            <Button variant="primary" size="sm" className="text-xs">
              Customize
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
