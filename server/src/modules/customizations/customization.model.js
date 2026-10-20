import mongoose from 'mongoose';
import crypto from 'crypto';

const artworkSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const sizeItemSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    surchargePerUnit: { type: Number, default: 0 },
    totalSurcharge: { type: Number, default: 0 },
  },
  { _id: false }
);

const customizationSchema = new mongoose.Schema(
  {
    customizationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'A valid product reference is required'],
      index: true,
    },
    productSnapshot: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      basePrice: { type: Number, required: true },
      imageUrl: { type: String, default: '' },
      categoryName: { type: String, default: 'Customized T-shirts' },
    },
    orderType: {
      type: String,
      enum: ['individual', 'group', 'event', 'corporate'],
      default: 'group',
      index: true,
    },
    selectedColor: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    sizeBreakdown: {
      type: [sizeItemSchema],
      required: [true, 'Size breakdown is required'],
      validate: [
        (sizes) => sizes && sizes.length > 0,
        'At least one size with quantity must be provided',
      ],
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: [10, 'Minimum order quantity for GIFT KRO custom T-shirts is 10 pieces'],
    },
    printLocations: {
      type: [String],
      default: ['front_chest'],
    },
    customText: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Custom text cannot exceed 500 characters'],
    },
    printingInstructions: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Printing instructions cannot exceed 2000 characters'],
    },
    artworks: {
      type: [artworkSchema],
      default: [],
    },
    contactInfo: {
      name: { type: String, required: [true, 'Contact name is required'], trim: true },
      email: { type: String, required: [true, 'Contact email is required'], trim: true, lowercase: true },
      phone: { type: String, required: [true, 'Contact phone number is required'], trim: true },
      organization: { type: String, default: '', trim: true },
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
    status: {
      type: String,
      enum: ['draft', 'submitted', 'in_review', 'converted_to_order', 'archived'],
      default: 'submitted',
      index: true,
    },
    turnaroundHours: {
      type: Number,
      default: 24,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a unique, human-friendly customization reference code.
 * Example: GK-CUST-8F3B1A2C
 */
customizationSchema.statics.generateCustomizationCode = function () {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GK-CUST-${randomHex}`;
};

export const Customization = mongoose.model('Customization', customizationSchema);
