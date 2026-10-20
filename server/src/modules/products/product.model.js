import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hex: {
      type: String,
      required: true,
      trim: true,
      match: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: 'GIFT KRO Custom T-shirt',
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [150, 'Name cannot exceed 150 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
      index: true,
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    minOrderQuantity: {
      type: Number,
      default: 10,
      min: [1, 'Minimum order quantity must be at least 1'],
    },
    availableSizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
      default: ['S', 'M', 'L', 'XL', '2XL'],
    },
    availableColors: {
      type: [colorSchema],
      default: [
        { name: 'Classic Black', hex: '#111827' },
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Navy Blue', hex: '#1E3A8A' },
      ],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category reference is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isExpressEligible: {
      type: Boolean,
      default: true,
    },
    turnaroundHours: {
      type: Number,
      default: 24,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'made_to_order', 'out_of_stock'],
      default: 'made_to_order',
    },
    specifications: {
      fabric: {
        type: String,
        default: '100% Super-Combed Bio-Washed Cotton',
      },
      gsm: {
        type: Number,
        default: 180,
      },
      printTechnique: {
        type: String,
        default: 'Digital Direct-to-Film (DTF) & Precision Screen Print',
      },
      fit: {
        type: String,
        default: 'Regular Unisex Fit',
      },
      origin: {
        type: String,
        default: 'Printed in Raipur Hub, Chhattisgarh',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Search indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Compound filtering indexes
productSchema.index({ category: 1, isActive: 1, isArchived: 1, basePrice: 1 });
productSchema.index({ isActive: 1, isArchived: 1, isFeatured: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
export default Product;
