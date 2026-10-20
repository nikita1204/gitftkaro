import { z } from 'zod';

const pincodeRegex = /^[1-9][0-9]{5}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const checkEligibilitySchema = {
  body: z.object({
    pincode: z
      .string({ required_error: 'PIN code is required' })
      .trim()
      .regex(pincodeRegex, 'Please provide a valid 6-digit Indian PIN code (e.g. 492001)'),
    totalQuantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int()
      .positive()
      .optional()
      .default(10),
    hasArtwork: z.boolean().optional().default(true),
    orderPlacedAt: z.string().datetime().optional().or(z.date()).optional(),
  }),
};

export const updateConfigSchema = {
  body: z.object({
    expressPromiseHours: z.number().int().min(12).max(72).optional(),
    maxExpressQuantity: z.number().int().positive().optional(),
    minExpressQuantity: z.number().int().positive().optional(),
    isCutOffActive: z.boolean().optional(),
    cutOffTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').optional(),
    operatingDays: z.array(z.number().int().min(0).max(6)).optional(),
    blackoutDates: z.array(z.string().or(z.date())).optional(),
    requireArtworkApproval: z.boolean().optional(),
  }),
};

export const createZoneSchema = {
  body: z.object({
    pincode: z.string().trim().regex(pincodeRegex, 'Must be a valid 6-digit PIN code'),
    areaName: z.string().min(2, 'Area name must be at least 2 characters'),
    city: z.string().default('Raipur'),
    district: z.string().default('Raipur'),
    state: z.string().default('Chhattisgarh'),
    isExpressEligible: z.boolean().default(true),
    expressDeliveryHours: z.number().int().default(24),
    standardDeliveryHours: z.number().int().default(48),
    notes: z.string().optional().default(''),
  }),
};
