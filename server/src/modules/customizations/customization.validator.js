import { z } from 'zod';
import { PRICING_CONFIG } from './pricing.config.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const sizeBreakdownItemSchema = z.object({
  size: z.string({ required_error: 'Size is required' }).trim(),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
});

const validateTotalQuantity = (sizes, ctx) => {
  const total = sizes.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  if (total < PRICING_CONFIG.minOrderQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Minimum order quantity for custom T-shirts is ${PRICING_CONFIG.minOrderQuantity} pieces. Current total: ${total} pieces.`,
      path: ['sizeBreakdown'],
    });
  }
};

export const calculateQuoteSchema = {
  body: z
    .object({
      productId: z
        .string({ required_error: 'Product ID is required' })
        .regex(objectIdRegex, 'Invalid Product ID format'),
      sizeBreakdown: z
        .array(sizeBreakdownItemSchema, {
          required_error: 'Size breakdown is required',
        })
        .min(1, 'At least one size item must be provided')
        .superRefine(validateTotalQuantity),
      printLocations: z
        .array(z.string())
        .optional()
        .default(['front_chest']),
      selectedColor: z
        .object({
          name: z.string().min(1, 'Color name is required'),
          hex: z.string().min(1, 'Color hex is required'),
        })
        .optional(),
    }),
};

export const createCustomizationSchema = {
  body: z
    .object({
      productId: z
        .string({ required_error: 'Product ID is required' })
        .regex(objectIdRegex, 'Invalid Product ID format'),
      orderType: z
        .enum(['individual', 'group', 'event', 'corporate'], {
          errorMap: () => ({
            message: 'Order type must be one of: individual, group, event, corporate',
          }),
        })
        .default('group'),
      selectedColor: z.object({
        name: z.string().min(1, 'Color name is required'),
        hex: z.string().min(1, 'Color hex code is required'),
      }),
      sizeBreakdown: z
        .array(sizeBreakdownItemSchema, {
          required_error: 'Size breakdown is required',
        })
        .min(1, 'At least one size item must be provided')
        .superRefine(validateTotalQuantity),
      printLocations: z
        .array(z.string())
        .min(1, 'Select at least one print location (e.g. Front Chest)')
        .default(['front_chest']),
      customText: z
        .string()
        .max(500, 'Custom text cannot exceed 500 characters')
        .optional()
        .default(''),
      printingInstructions: z
        .string()
        .max(2000, 'Printing instructions cannot exceed 2000 characters')
        .optional()
        .default(''),
      artworks: z
        .array(
          z.object({
            filename: z.string().min(1),
            originalName: z.string().min(1),
            mimetype: z.string().min(1),
            size: z.number().positive(),
            url: z.string().min(1),
          })
        )
        .optional()
        .default([]),
      contactInfo: z.object({
        name: z.string().min(2, 'Contact name must be at least 2 characters'),
        email: z.string().email('Valid contact email is required'),
        phone: z
          .string()
          .min(10, 'Contact phone must be at least 10 digits')
          .max(15, 'Contact phone must not exceed 15 digits'),
        organization: z.string().optional().default(''),
      }),
    }),
};

export const queryCustomizationsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    orderType: z.enum(['individual', 'group', 'event', 'corporate']).optional(),
    status: z.enum(['draft', 'submitted', 'in_review', 'converted_to_order', 'archived']).optional(),
    search: z.string().trim().optional(),
  }),
};
