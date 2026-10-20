import mongoose from 'mongoose';

const deliveryConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_delivery_config',
      unique: true,
      index: true,
    },
    expressPromiseHours: {
      type: Number,
      default: 24,
      min: 12,
      max: 72,
    },
    minExpressQuantity: {
      type: Number,
      default: 10,
    },
    maxExpressQuantity: {
      type: Number,
      default: 100, // Orders > 100 pieces require 48-72h
    },
    isCutOffActive: {
      type: Boolean,
      default: false, // Default: rolling 24h as per business preference
    },
    cutOffTime: {
      type: String,
      default: '14:00', // 2:00 PM IST
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Cut-off time must be in HH:MM 24-hour format'],
    },
    operatingDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6], // 7 days a week (0 = Sunday, 6 = Saturday)
    },
    blackoutDates: {
      type: [Date],
      default: [],
    },
    requireArtworkApproval: {
      type: Boolean,
      default: true,
    },
    standardDeliveryDays: {
      type: Number,
      default: 3,
    },
    hubName: {
      type: String,
      default: 'Raipur Express Printing Facility, Chhattisgarh',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export const DeliveryConfig = mongoose.model('DeliveryConfig', deliveryConfigSchema);
