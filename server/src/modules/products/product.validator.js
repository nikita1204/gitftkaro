import { z } from 'zod';

export const productQuerySchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
    limit: z
      .string()
      .optional()
      .default('12')
      .transform((val) => Math.min(50, Math.max(1, parseInt(val, 10) || 12))),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    size: z.string().optional(),
    color: z.string().optional(),
    isExpressEligible: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    isFeatured: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : undefined)),
    sort: z
      .enum(['newest', 'price_asc', 'price_desc', 'popular', 'name_asc'])
      .optional()
      .default('newest'),
    includeInactive: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
};

export const createProductSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(2, { message: 'Product name must be at least 2 characters long' })
      .max(150, { message: 'Product name cannot exceed 150 characters' }),
    slug: z.string().trim().optional(),
    description: z
      .string({ required_error: 'Product description is required' })
      .trim()
      .min(10, { message: 'Description must be at least 10 characters long' }),
    shortDescription: z.string().trim().optional(),
    basePrice: z
      .number({ required_error: 'Base price is required' })
      .min(0, { message: 'Base price cannot be negative' }),
    compareAtPrice: z.number().optional().nullable(),
    minOrderQuantity: z.number().min(1).optional().default(10),
    availableSizes: z.array(z.string()).optional(),
    availableColors: z
      .array(
        z.object({
          name: z.string(),
          hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
        })
      )
      .optional(),
    category: z.string({ required_error: 'Category ID is required' }),
    images: z
      .array(
        z.object({
          url: z.string(),
          alt: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .optional(),
    isFeatured: z.boolean().optional().default(false),
    isExpressEligible: z.boolean().optional().default(true),
    turnaroundHours: z.number().optional().default(24),
    stockStatus: z.enum(['in_stock', 'made_to_order', 'out_of_stock']).optional(),
    specifications: z
      .object({
        fabric: z.string().optional(),
        gsm: z.number().optional(),
        printTechnique: z.string().optional(),
        fit: z.string().optional(),
        origin: z.string().optional(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
};

export const updateProductSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(10).optional(),
    shortDescription: z.string().trim().optional(),
    basePrice: z.number().min(0).optional(),
    compareAtPrice: z.number().optional().nullable(),
    minOrderQuantity: z.number().min(1).optional(),
    availableSizes: z.array(z.string()).optional(),
    availableColors: z
      .array(
        z.object({
          name: z.string(),
          hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
        })
      )
      .optional(),
    category: z.string().optional(),
    images: z
      .array(
        z.object({
          url: z.string(),
          alt: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .optional(),
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isExpressEligible: z.boolean().optional(),
    turnaroundHours: z.number().optional(),
    stockStatus: z.enum(['in_stock', 'made_to_order', 'out_of_stock']).optional(),
    specifications: z
      .object({
        fabric: z.string().optional(),
        gsm: z.number().optional(),
        printTechnique: z.string().optional(),
        fit: z.string().optional(),
        origin: z.string().optional(),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
};

export const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    slug: z.string().trim().optional(),
    description: z.string().trim().min(5).max(500),
    image: z.string().optional(),
    badge: z.string().optional(),
    turnaroundHours: z.number().optional(),
    minOrderQuantity: z.number().optional(),
    displayOrder: z.number().optional(),
  }),
};
