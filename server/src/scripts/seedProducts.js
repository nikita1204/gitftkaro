import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Category } from '../modules/products/category.model.js';
import { Product } from '../modules/products/product.model.js';
import { logger } from '../utils/logger.js';

const initialCategories = [
  {
    name: 'Customized T-shirts',
    slug: 'customized-t-shirts',
    description:
      'Personalized graphic, photo, and typography t-shirts printed and delivered within 24 hours across Raipur.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    badge: '24h Express',
    turnaroundHours: 24,
    minOrderQuantity: 10,
    displayOrder: 1,
  },
  {
    name: 'Event T-shirts',
    slug: 'event-t-shirts',
    description:
      'High-energy, vibrant custom t-shirts engineered for college fests, sports leagues, marathons, and cultural events.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    badge: 'Express Bulk',
    turnaroundHours: 24,
    minOrderQuantity: 10,
    displayOrder: 2,
  },
  {
    name: 'Group T-shirts',
    slug: 'group-t-shirts',
    description:
      'Matching squad tees for college trips, family reunions, bachelor celebrations, and friend groups.',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80',
    badge: 'MOQ 10 Pcs',
    turnaroundHours: 24,
    minOrderQuantity: 10,
    displayOrder: 3,
  },
  {
    name: 'Corporate T-shirts',
    slug: 'corporate-t-shirts',
    description:
      'Premium bio-washed polo and round-neck shirts with custom company logo embroidery and screen printing.',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    badge: 'Premium Polo',
    turnaroundHours: 24,
    minOrderQuantity: 10,
    displayOrder: 4,
  },
];

const seedCatalog = async () => {
  try {
    logger.info('Connecting to MongoDB for catalog seeding...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected.');

    // 1. Seed or Upsert Categories
    const categoryMap = {};
    for (const catData of initialCategories) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        logger.info(`Created category: ${catData.name}`);
      } else {
        Object.assign(category, catData);
        await category.save();
        logger.info(`Updated category: ${catData.name}`);
      }
      categoryMap[catData.slug] = category._id;
    }

    // 2. Define Products
    const productsData = [
      // Customized T-shirts
      {
        name: 'Raipur 24h Express Bio-Washed Crew Neck T-Shirt',
        slug: 'raipur-24h-express-bio-washed-crew-neck-t-shirt',
        category: categoryMap['customized-t-shirts'],
        description:
          'Our flagship 24-hour custom printed t-shirt crafted for Raipur individuals, events, and businesses. Made from 180 GSM 100% super-combed bio-washed cotton, ensuring ultra-soft hand feel and zero color bleed after washing. Printed locally in our Raipur hub with industrial DTF and high-density screen printing.',
        shortDescription: '180 GSM Bio-Washed Cotton &bull; 24h Express Dispatch in Raipur',
        basePrice: 299,
        compareAtPrice: 499,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: [
          { name: 'Classic Black', hex: '#111827' },
          { name: 'Pure White', hex: '#FFFFFF' },
          { name: 'Navy Blue', hex: '#1E3A8A' },
          { name: 'Crimson Maroon', hex: '#881337' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            alt: 'Raipur 24h Express Bio-Washed Crew Neck T-Shirt Front',
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
            alt: 'Bio-Washed Cotton Fabric Detail',
            isPrimary: false,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Super-Combed Bio-Washed Cotton',
          gsm: 180,
          printTechnique: 'Digital DTF & High-Density Screen Print',
          fit: 'Regular Unisex Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['24-hour', 'express', 'bio-washed', 'customized', 'raipur'],
      },
      {
        name: 'Custom Photo & Multi-Color Graphic DTF T-Shirt',
        slug: 'custom-photo-and-multi-color-graphic-dtf-t-shirt',
        category: categoryMap['customized-t-shirts'],
        description:
          'High-definition photographic reproduction on premium combed cotton. Perfect for birthday surprises, anniversary keepsakes, and customized meme graphics. Unlimited color gradients with razor-sharp 1200 DPI print quality.',
        shortDescription: 'Photo-Quality HD Print &bull; Soft-Touch Breathable Finish',
        basePrice: 349,
        compareAtPrice: 549,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
        availableColors: [
          { name: 'Classic Black', hex: '#111827' },
          { name: 'Pure White', hex: '#FFFFFF' },
          { name: 'Charcoal Grey', hex: '#374151' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
            alt: 'Graphic DTF T-shirt Preview',
            isPrimary: true,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Ring-Spun Cotton',
          gsm: 190,
          printTechnique: 'Ultra-HD Direct-To-Film (DTF)',
          fit: 'Standard Regular Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['photo-print', 'graphic', 'customized', 'birthday'],
      },

      // Event T-shirts
      {
        name: 'College Fest & Cultural Summit Express Event T-Shirt',
        slug: 'college-fest-and-cultural-summit-express-event-t-shirt',
        category: categoryMap['event-t-shirts'],
        description:
          'Designed specifically for college festivals, youth summits, and inter-university competitions across Chhattisgarh (NIT Raipur, AIIMS, Hidayatullah, etc.). Lightweight, breathable cotton blend with front and back dual-zone printing for sponsors and committee titles.',
        shortDescription: 'Bulk College Fest Tees &bull; Dual-Zone Sponsor Printing',
        basePrice: 249,
        compareAtPrice: 399,
        minOrderQuantity: 15,
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: [
          { name: 'Royal Blue', hex: '#2563EB' },
          { name: 'Bright Yellow', hex: '#EAB308' },
          { name: 'Forest Green', hex: '#16A34A' },
          { name: 'Fiery Red', hex: '#DC2626' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
            alt: 'College Fest T-shirt Preview',
            isPrimary: true,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Combed Cotton Single Jersey',
          gsm: 160,
          printTechnique: 'Plastisol Screen Print with Long Wash Life',
          fit: 'Unisex Relaxed Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['college', 'event', 'fest', 'raipur', 'bulk'],
      },
      {
        name: 'Raipur Marathon Moisture-Wicking Dry-Fit Sports Tee',
        slug: 'raipur-marathon-moisture-wicking-dry-fit-sports-tee',
        category: categoryMap['event-t-shirts'],
        description:
          'High-performance micro-poly honeycomb fabric engineered for maximum sweat evaporation during marathons, cricket tournaments, and athletic meets. Anti-microbial and lightweight with vibrant sublimation print that never fades or peels.',
        shortDescription: 'Micro-Poly Quick Dry &bull; Sublimation All-Over & Chest Print',
        basePrice: 279,
        compareAtPrice: 429,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
        availableColors: [
          { name: 'Neon Green', hex: '#22C55E' },
          { name: 'Electric Blue', hex: '#0EA5E9' },
          { name: 'Pure White', hex: '#FFFFFF' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
            alt: 'Sports Marathon Dry Fit Tee',
            isPrimary: true,
          },
        ],
        isFeatured: false,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Polyester Micro-Dot Dry-Fit',
          gsm: 150,
          printTechnique: 'Digital Sublimation Infusion',
          fit: 'Athletic Aerodynamic Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['marathon', 'sports', 'dry-fit', 'event'],
      },

      // Group T-shirts
      {
        name: 'Squad & Reunion Matching Group T-Shirt',
        slug: 'squad-and-reunion-matching-group-t-shirt',
        category: categoryMap['group-t-shirts'],
        description:
          'Celebrate lifelong friendships, alumni homecomings, and family reunions with custom matching group tees. Personalize each shirt with individual nicknames on the back while maintaining uniform chest typography.',
        shortDescription: 'Custom Individual Nicknames &bull; MOQ 10 Pieces',
        basePrice: 289,
        compareAtPrice: 449,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
        availableColors: [
          { name: 'Classic Black', hex: '#111827' },
          { name: 'Dusty Pink', hex: '#EC4899' },
          { name: 'Olive Green', hex: '#4D7C0F' },
          { name: 'Navy Blue', hex: '#1E3A8A' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80',
            alt: 'Group Squad Matching T-Shirts',
            isPrimary: true,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Bio-Washed Cotton',
          gsm: 180,
          printTechnique: 'Hybrid Screen & Vinyl Nicknames',
          fit: 'Unisex Comfort Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['group', 'squad', 'reunion', 'trip', 'matching'],
      },
      {
        name: 'Streetwear Back-Print Oversized Group Tee',
        slug: 'streetwear-back-print-oversized-group-tee',
        category: categoryMap['group-t-shirts'],
        description:
          'Trendy drop-shoulder streetwear silhouette crafted from heavy 220 GSM luxury cotton. Statement typography on the back with minimalist chest emblem. Premium ribbed collar that retains shape wash after wash.',
        shortDescription: '220 GSM Heavyweight &bull; Drop-Shoulder Oversized Fit',
        basePrice: 399,
        compareAtPrice: 599,
        minOrderQuantity: 10,
        availableSizes: ['M', 'L', 'XL', '2XL'],
        availableColors: [
          { name: 'Vintage Black', hex: '#18181B' },
          { name: 'Sand Beige', hex: '#D4D4D8' },
          { name: 'Sage Green', hex: '#84CC16' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
            alt: 'Oversized Streetwear T-shirt Preview',
            isPrimary: true,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Heavyweight Combed Cotton',
          gsm: 220,
          printTechnique: 'High-Density Puff & Screen Print',
          fit: 'Boxy Drop-Shoulder Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['oversized', 'streetwear', 'group', 'heavyweight'],
      },

      // Corporate T-shirts
      {
        name: 'Executive Bio-Washed Pique Polo Corporate T-Shirt',
        slug: 'executive-bio-washed-pique-polo-corporate-t-shirt',
        category: categoryMap['corporate-t-shirts'],
        description:
          'Refined professional corporate apparel for Raipur executives, tech startups, retail franchises, and industrial staff. Knitted 220 GSM breathable pique cotton with rib-knit collar and cuffs. Tailored placket with mother-of-pearl finish buttons and precision chest embroidery.',
        shortDescription: '220 GSM Pique Cotton Polo &bull; Precision Embroidery & Print',
        basePrice: 449,
        compareAtPrice: 699,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
        availableColors: [
          { name: 'Midnight Navy', hex: '#0F172A' },
          { name: 'Pitch Black', hex: '#09090B' },
          { name: 'Steel Grey', hex: '#4B5563' },
          { name: 'Royal Maroon', hex: '#4C0519' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
            alt: 'Executive Pique Polo Corporate T-Shirt',
            isPrimary: true,
          },
        ],
        isFeatured: true,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Combed Pique Cotton Matty',
          gsm: 220,
          printTechnique: 'High-Density Thread Embroidery & Screen Print',
          fit: 'Tailored Regular Fit Polo',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['corporate', 'polo', 'embroidery', 'uniform', 'executive'],
      },
      {
        name: 'Startup Team Round-Neck Corporate Uniform Tee',
        slug: 'startup-team-round-neck-corporate-uniform-tee',
        category: categoryMap['corporate-t-shirts'],
        description:
          'Cost-effective, modern everyday corporate uniform for startup team members, onboarding welcome kits, and hackathons. Minimalist chest logo with optional website URL or slogan on back sleeve.',
        shortDescription: '180 GSM Everyday Workwear &bull; Crisp Corporate Branding',
        basePrice: 329,
        compareAtPrice: 499,
        minOrderQuantity: 10,
        availableSizes: ['S', 'M', 'L', 'XL', '2XL'],
        availableColors: [
          { name: 'Charcoal Grey', hex: '#334155' },
          { name: 'Crisp White', hex: '#FFFFFF' },
          { name: 'Classic Black', hex: '#111827' },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            alt: 'Corporate Uniform Round Neck Tee',
            isPrimary: true,
          },
        ],
        isFeatured: false,
        isExpressEligible: true,
        turnaroundHours: 24,
        stockStatus: 'made_to_order',
        specifications: {
          fabric: '100% Super-Combed Cotton',
          gsm: 180,
          printTechnique: 'Precision Screen Print',
          fit: 'Unisex Regular Fit',
          origin: 'Raipur Express Facility, Chhattisgarh',
        },
        tags: ['corporate', 'uniform', 'startup', 'onboarding'],
      },
    ];

    // 3. Upsert Products
    for (const prodData of productsData) {
      let product = await Product.findOne({ slug: prodData.slug });
      if (!product) {
        product = await Product.create(prodData);
        logger.info(`Created product: ${prodData.name} (Base Price: Rs ${prodData.basePrice})`);
      } else {
        Object.assign(product, prodData);
        await product.save();
        logger.info(`Updated product: ${prodData.name}`);
      }
    }

    logger.info('====================================================');
    logger.info(' CATALOG SEEDING COMPLETED SUCCESSFULLY             ');
    logger.info(` Categories: ${initialCategories.length} seeded     `);
    logger.info(` Products:   ${productsData.length} seeded          `);
    logger.info('====================================================');
  } catch (error) {
    logger.error(`Error during catalog seeding: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed.');
  }
};

seedCatalog();
