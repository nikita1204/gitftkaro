import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    orderType: {
      type: String,
      enum: ['group', 'event', 'corporate', 'individual'],
      default: 'group',
    },
    selectedColor: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    sizeBreakdown: [
      {
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    printLocations: [
      {
        type: String,
        default: 'front_chest',
      },
    ],
    customText: {
      type: String,
      default: '',
    },
    printingInstructions: {
      type: String,
      default: '',
    },
    artworks: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true },
        approvalStatus: {
          type: String,
          enum: ['pending', 'approved', 'revision_requested'],
          default: 'pending',
        },
        reviewNotes: {
          type: String,
          default: '',
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        reviewedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    pricing: {
      basePricePerUnit: { type: Number, required: true },
      garmentSubtotal: { type: Number, required: true },
      sizeSurchargeSubtotal: { type: Number, default: 0 },
      subtotal: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      effectivePricePerPiece: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    changedByName: {
      type: String,
      default: 'System',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    contact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      organization: { type: String, default: '', trim: true },
    },
    shippingAddress: {
      streetAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
      areaLocality: { type: String, required: true },
      city: { type: String, default: 'Raipur' },
      state: { type: String, default: 'Chhattisgarh' },
      pincode: { type: String, required: true },
      deliveryNotes: { type: String, default: '' },
    },
    deliveryEstimate: {
      is24hEligible: { type: Boolean, default: true },
      status: { type: String, default: 'eligible_24h_express' },
      guaranteedHours: { type: Number, default: 24 },
      estimatedDeliveryDate: { type: Date, default: null },
      estimatedDeliveryWindow: { type: String, default: '24-Hour Express Guaranteed' },
      dispatchWindow: { type: String, default: '' },
      hub: { type: String, default: 'Raipur Express Printing Facility, Chhattisgarh' },
      conditions: [{ type: String }],
      shippingFee: { type: Number, default: 0 },
      shippingType: { type: String, default: '24-Hour Raipur Express Doorstep Delivery' },
    },
    items: [orderItemSchema],
    pricingSummary: {
      totalItems: { type: Number, required: true },
      totalQuantity: { type: Number, required: true },
      garmentSubtotal: { type: Number, required: true },
      sizeSurchargeSubtotal: { type: Number, default: 0 },
      subtotal: { type: Number, required: true },
      totalDiscount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      finalTotal: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    payment: {
      provider: {
        type: String,
        enum: ['razorpay', 'cod_advance', 'mock_sandbox'],
        default: 'razorpay',
      },
      status: {
        type: String,
        enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'pending',
        index: true,
      },
      razorpayOrderId: {
        type: String,
        default: null,
        index: true,
      },
      razorpayPaymentId: {
        type: String,
        default: null,
      },
      razorpaySignature: {
        type: String,
        default: null,
      },
      amountPaid: {
        type: Number,
        default: 0,
      },
      paidAt: {
        type: Date,
        default: null,
      },
      failureReason: {
        type: String,
        default: null,
      },
      idempotencyKey: {
        type: String,
        default: null,
        index: true,
      },
    },
    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'payment_failed',
        'confirmed',
        'in_production',
        'quality_check',
        'dispatched',
        'delivered',
        'cancelled',
      ],
      default: 'pending_payment',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast administrative lookups and status filtering
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'contact.email': 1, createdAt: -1 });
orderSchema.index({ 'contact.phone': 1, createdAt: -1 });
orderSchema.index({ 'shippingAddress.pincode': 1 });

export const Order = mongoose.model('Order', orderSchema);
