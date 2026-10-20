import { z } from 'zod';

const indianPincodeRegex = /^[1-9][0-9]{5}$/;

export const createOrderSchema = {
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
      areaLocality: z.string().min(2, 'Raipur area or locality is required'),
      city: z.string().default('Raipur'),
      state: z.string().default('Chhattisgarh'),
      pincode: z
        .string()
        .regex(indianPincodeRegex, 'Please provide a valid 6-digit Indian PIN code (e.g. 492001)'),
      deliveryNotes: z.string().max(500).optional().default(''),
    }),
    idempotencyKey: z.string().optional(),
  }),
};

export const verifyPaymentSchema = {
  body: z.object({
    razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay cryptographic signature is required'),
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({
    orderStatus: z.enum(
      [
        'pending_payment',
        'payment_failed',
        'confirmed',
        'in_production',
        'quality_check',
        'dispatched',
        'delivered',
        'cancelled',
      ],
      {
        errorMap: () => ({
          message:
            'Order status must be one of: pending_payment, payment_failed, confirmed, in_production, quality_check, dispatched, delivered, cancelled',
        }),
      }
    ),
    comment: z.string().max(500).optional().default(''),
  }),
};

export const updateArtworkStatusSchema = {
  body: z.object({
    approvalStatus: z.enum(['pending', 'approved', 'revision_requested'], {
      errorMap: () => ({
        message: 'Approval status must be one of: pending, approved, revision_requested',
      }),
    }),
    reviewNotes: z.string().max(1000).optional().default(''),
  }),
};

export const orderQuerySchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z
      .string()
      .optional()
      .default('15')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    status: z.string().optional(),
    search: z.string().optional(),
    isExpress: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    sort: z.enum(['newest', 'oldest', 'amount_desc', 'amount_asc']).optional().default('newest'),
  }),
};
