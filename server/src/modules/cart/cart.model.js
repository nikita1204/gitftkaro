import mongoose from 'mongoose';

const cartItemArtworkSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const cartItemSizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    surchargePerUnit: { type: Number, default: 0 },
    totalSurcharge: { type: Number, default: 0 },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    customization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customization',
      default: null,
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
    sizeBreakdown: {
      type: [cartItemSizeSchema],
      required: true,
      validate: [
        (sizes) => sizes && sizes.length > 0,
        'Size breakdown must contain at least one size with quantity',
      ],
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: [10, 'Minimum order quantity for customized T-shirts is 10 pieces'],
    },
    printLocations: {
      type: [String],
      default: ['front_chest'],
    },
    customText: {
      type: String,
      default: '',
      trim: true,
    },
    printingInstructions: {
      type: String,
      default: '',
      trim: true,
    },
    artworks: {
      type: [cartItemArtworkSchema],
      default: [],
    },
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
    revalidation: {
      isAvailable: { type: Boolean, default: true },
      hasPriceChanged: { type: Boolean, default: false },
      previousBasePrice: { type: Number, default: null },
      currentBasePrice: { type: Number, default: null },
      warningMessage: { type: String, default: '' },
    },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestToken: {
      type: String,
      default: null,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    summary: {
      totalItems: { type: Number, default: 0 },
      totalQuantity: { type: Number, default: 0 },
      garmentSubtotal: { type: Number, default: 0 },
      sizeSurchargeSubtotal: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      estimatedShipping: { type: Number, default: 0 },
      estimatedDeliveryHours: { type: Number, default: 24 },
      finalTotal: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isMoqSatisfied: { type: Boolean, default: true },
      canProceedToCheckout: { type: Boolean, default: false },
      warnings: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
