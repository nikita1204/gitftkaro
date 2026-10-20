import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      unique: true,
      trim: true,
      index: true,
      match: [/^[1-9][0-9]{5}$/, 'PIN code must be a valid 6-digit Indian postal code'],
    },
    areaName: {
      type: String,
      required: [true, 'Area or locality name is required'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Raipur',
      trim: true,
    },
    district: {
      type: String,
      default: 'Raipur',
      trim: true,
    },
    state: {
      type: String,
      default: 'Chhattisgarh',
      trim: true,
    },
    isExpressEligible: {
      type: Boolean,
      default: true,
      index: true,
    },
    expressDeliveryHours: {
      type: Number,
      default: 24,
    },
    standardDeliveryHours: {
      type: Number,
      default: 48,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 0, // Free delivery for custom orders
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
