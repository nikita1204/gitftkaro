import { z } from 'zod';
import { PRICING_CONFIG } from '../customizations/pricing.config.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const indianPincodeRegex = /^[1-9][0-9]{5}$/;

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
      message: `Minimum order quantity for customized T-shirts is ${PRICING_CONFIG.minOrderQuantity} pieces. Current total: ${total} pieces.`,
      path: ['sizeBreakdown'],
    });
  }
};

export const addItemToCartSchema = {
  body: z.object({
    productId: z
      .string({ required_error: 'Product ID is required' })
      .regex(objectIdRegex, 'Invalid Product ID format'),
    customizationId: z
      .string()
      .regex(objectIdRegex, 'Invalid Customization ID format')
      .optional()
      .nullable(),
    orderType: z
      .enum(['group', 'event', 'corporate', 'individual'], {
        errorMap: () => ({
          message: 'Order type must be one of: group, event, corporate, individual',
        }),
      })
      .default('group'),
    selectedColor: z.object({
      name: z.string().min(1, 'Color name is required'),
      hex: z.string().min(1, 'Color hex is required'),
    }),
    sizeBreakdown: z
      .array(sizeBreakdownItemSchema, {
        required_error: 'Size breakdown is required',
      })
      .min(1, 'At least one size item must be provided')
      .superRefine(validateTotalQuantity),
    printLocations: z.array(z.string()).optional().default(['front_chest']),
    customText: z.string().max(500).optional().default(''),
    printingInstructions: z.string().max(2000).optional().default(''),
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
  }),
};

export const updateCartItemSchema = {
  body: z.object({
    sizeBreakdown: z
      .array(sizeBreakdownItemSchema, {
        required_error: 'Size breakdown is required',
      })
      .min(1, 'At least one size item must be provided')
      .superRefine(validateTotalQuantity),
    selectedColor: z
      .object({
        name: z.string().min(1),
        hex: z.string().min(1),
      })
      .optional(),
    printLocations: z.array(z.string()).optional(),
    customText: z.string().max(500).optional(),
    printingInstructions: z.string().max(2000).optional(),
  }),
};

export const checkoutPreparationSchema = {
  body: z.object({
    contact: z.object({
      name: z.string().min(2, 'Full coordinator name must be at least 2 characters'),
      email: z.string().email('Valid email address is required'),
      phone: z
        .string()
        .min(10, 'Contact phone number must be at least 10 digits')
        .max(15, 'Contact phone number must not exceed 15 digits'),
      organization: z.string().optional().default(''),
    }),
    shippingAddress: z.object({
      streetAddress: z
        .string()
        .min(5, 'Street address must be at least 5 characters (building/premises)'),
      landmark: z.string().optional().default(''),
      areaLocality: z
        .string()
        .min(2, 'Raipur area or locality is required (e.g. Pandri, Telibandha, Shankar Nagar)'),
      city: z.string().default('Raipur'),
      state: z.string().default('Chhattisgarh'),
      pincode: z
        .string()
        .regex(indianPincodeRegex, 'Please provide a valid 6-digit Indian PIN code (e.g. 492001)'),
      deliveryNotes: z.string().max(500).optional().default(''),
      expressPreference: z.enum(['standard_24h', 'priority_morning']).default('standard_24h'),
    }),
  }),
};
