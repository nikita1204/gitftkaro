import { DeliveryZone } from './deliveryZone.model.js';
import { DeliveryConfig } from './deliveryConfig.model.js';

export const DEFAULT_RAIPUR_PINCODES = [
  { pincode: '492001', areaName: 'Telibandha, Pandri, Shankar Nagar, Civil Lines', district: 'Raipur' },
  { pincode: '492002', areaName: 'Pachpedi Naka, Byron Bazar, Tikrapara', district: 'Raipur' },
  { pincode: '492003', areaName: 'WRS Colony, Khamtarai', district: 'Raipur' },
  { pincode: '492004', areaName: 'Samta Colony, Gudhiyari, Kota', district: 'Raipur' },
  { pincode: '492005', areaName: 'Urla Industrial Area, Birgaon', district: 'Raipur' },
  { pincode: '492006', areaName: 'VIP Road, Devendra Nagar, Airport Area', district: 'Raipur' },
  { pincode: '492007', areaName: 'Mowa, Saddu', district: 'Raipur' },
  { pincode: '492008', areaName: 'Ravigram, Telibandha Ext.', district: 'Raipur' },
  { pincode: '492009', areaName: 'Tatibandh, AIIMS Raipur, GE Road', district: 'Raipur' },
  { pincode: '492010', areaName: 'Hirapur, Sarona', district: 'Raipur' },
  { pincode: '492011', areaName: 'DDU Nagar, Amanaka, Sunder Nagar', district: 'Raipur' },
  { pincode: '492012', areaName: 'Bhanpuri, Rawabhata', district: 'Raipur' },
  { pincode: '492013', areaName: 'Mandir Hasaud', district: 'Raipur' },
  { pincode: '492014', areaName: 'Naya Raipur, Atal Nagar', district: 'Raipur' },
  { pincode: '492015', areaName: 'Sejbahar, Mujgahan', district: 'Raipur' },
];

export class DeliveryService {
  /**
   * Retrieve or initialize global delivery settings.
   */
  static async getDeliveryConfig() {
    let config = await DeliveryConfig.findOne({ key: 'global_delivery_config' });
    if (!config) {
      config = new DeliveryConfig();
      await config.save();
    }
    return config;
  }

  /**
   * Update delivery rules (Admin).
   */
  static async updateDeliveryConfig(updateData, userId = null) {
    let config = await DeliveryConfig.findOne({ key: 'global_delivery_config' });
    if (!config) {
      config = new DeliveryConfig();
    }

    Object.assign(config, updateData);
    if (userId) config.updatedBy = userId;
    return await config.save();
  }

  /**
   * Ensure default Raipur PIN codes are seeded in database.
   */
  static async seedDefaultPincodes() {
    const count = await DeliveryZone.countDocuments();
    if (count === 0) {
      const docs = DEFAULT_RAIPUR_PINCODES.map((item) => ({
        ...item,
        city: 'Raipur',
        state: 'Chhattisgarh',
        isExpressEligible: true,
        expressDeliveryHours: 24,
        standardDeliveryHours: 48,
        freeDeliveryThreshold: 0,
        deliveryFee: 0,
        isActive: true,
      }));
      await DeliveryZone.insertMany(docs);
    }
    return await DeliveryZone.find().sort({ pincode: 1 }).lean();
  }

  /**
   * Retrieve list of all active serviceable zones/pincodes for client autocomplete.
   */
  static async getServiceablePincodes() {
    await this.seedDefaultPincodes();
    return await DeliveryZone.find({ isActive: true }).sort({ pincode: 1 }).lean();
  }

  /**
   * Validate delivery eligibility and compute dynamic delivery timeline.
   * Accounts for serviceable pincode, quantity capacity, cut-off times, and artwork conditions.
   *
   * @param {Object} params
   * @param {string} params.pincode
   * @param {number} [params.totalQuantity=10]
   * @param {boolean} [params.hasArtwork=true]
   * @param {Date|string} [params.orderPlacedAt]
   */
  static async checkEligibility({
    pincode,
    totalQuantity = 10,
    hasArtwork = true,
    orderPlacedAt = new Date(),
  }) {
    if (!pincode || !/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
      return {
        isValidPincode: false,
        isServiceable: false,
        is24hEligible: false,
        status: 'invalid_pincode',
        reason: 'Please enter a valid 6-digit postal PIN code.',
        estimatedDeliveryHours: 72,
        estimatedDeliveryWindow: 'Standard: 3–5 Business Days',
      };
    }

    const cleanPincode = String(pincode).trim();
    const config = await this.getDeliveryConfig();

    // Check database zone
    let zone = await DeliveryZone.findOne({ pincode: cleanPincode });
    if (!zone && cleanPincode.startsWith('492')) {
      // Auto-fallback check if it's within Raipur district range
      await this.seedDefaultPincodes();
      zone = await DeliveryZone.findOne({ pincode: cleanPincode });
    }

    const parsedDate = new Date(orderPlacedAt);
    const orderTimestamp = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // 1. Ineligible: Outside Raipur Serviceable Express Zones
    if (!zone || !zone.isActive || !zone.isExpressEligible) {
      return {
        isValidPincode: true,
        pincode: cleanPincode,
        isServiceable: false,
        is24hEligible: false,
        status: 'out_of_express_zone',
        areaName: zone?.areaName || 'Outside Raipur Express Zone',
        reason: `PIN code ${cleanPincode} is located outside GIFT KRO's 24-hour express production boundary.`,
        explanation:
          'Our 24-hour express facility is optimized for Raipur central and surrounding industrial clusters. Orders to this location require standard courier transit.',
        estimatedDeliveryHours: 72,
        estimatedDeliveryWindow: 'Standard Transit: 3–5 Business Days',
        shippingFee: 0,
        hub: config.hubName,
      };
    }

    // 2. Ineligible: Below Minimum Order Quantity (MOQ < 10)
    if (totalQuantity < config.minExpressQuantity) {
      return {
        isValidPincode: true,
        pincode: cleanPincode,
        areaName: zone.areaName,
        isServiceable: true,
        is24hEligible: false,
        status: 'below_moq',
        reason: `Minimum order quantity for custom t-shirts is ${config.minExpressQuantity} pieces. Current order is ${totalQuantity} pieces.`,
        explanation:
          'Express setup and screen preparation require a minimum batch run of 10 customized garments.',
        estimatedDeliveryHours: null,
        estimatedDeliveryWindow: 'Requires MOQ 10 Pieces',
        shippingFee: 0,
        hub: config.hubName,
      };
    }

    // 3. Ineligible for 24h: Capacity Exceeded (Quantity > 100 pieces)
    if (totalQuantity > config.maxExpressQuantity) {
      const estimatedDeliveryDate = new Date(orderTimestamp.getTime() + 48 * 60 * 60 * 1000);
      return {
        isValidPincode: true,
        pincode: cleanPincode,
        areaName: zone.areaName,
        isServiceable: true,
        is24hEligible: false,
        status: 'capacity_exceeded',
        reason: `Large bulk order (${totalQuantity} pieces) exceeds the 24-hour express single-batch limit of ${config.maxExpressQuantity} pieces.`,
        explanation:
          `Orders over ${config.maxExpressQuantity} pieces require 48–72 hours for multi-stage printing, drying, curing, and rigorous quality inspection.`,
        estimatedDeliveryHours: 48,
        deliveryHours: 48,
        estimatedDeliveryDate,
        estimatedDeliveryWindow: '48–72 Hours (2–3 Days)',
        shippingFee: 0,
        hub: config.hubName,
      };
    }

    // 4. Eligible for 24-Hour Express Promise!
    let deliveryHours = config.expressPromiseHours; // default 24h
    let cutOffNotice = '';

    // If admin enabled daily cut-off time (e.g. 14:00 IST)
    if (config.isCutOffActive && config.cutOffTime) {
      const [cutHour, cutMinute] = config.cutOffTime.split(':').map(Number);
      const orderHour = orderTimestamp.getHours();
      const orderMinute = orderTimestamp.getMinutes();

      if (orderHour > cutHour || (orderHour === cutHour && orderMinute >= cutMinute)) {
        deliveryHours += 24; // Rolled over to next production day
        cutOffNotice = `Order confirmed after daily cut-off (${config.cutOffTime} IST); dispatched in next production cycle.`;
      }
    }

    const estimatedDeliveryDate = new Date(orderTimestamp.getTime() + deliveryHours * 60 * 60 * 1000);

    const conditions = [];
    if (!hasArtwork && config.requireArtworkApproval) {
      conditions.push('24-hour turnaround begins once artwork or proof is confirmed by customer.');
    }
    if (cutOffNotice) {
      conditions.push(cutOffNotice);
    }

    return {
      isValidPincode: true,
      pincode: cleanPincode,
      areaName: zone.areaName,
      city: zone.city,
      district: zone.district,
      isServiceable: true,
      is24hEligible: deliveryHours === 24,
      status: 'eligible_24h_express',
      deliveryHours,
      estimatedDeliveryDate,
      estimatedDeliveryWindow:
        deliveryHours === 24
          ? 'Guaranteed Delivery in 24 Hours'
          : `Estimated Delivery in ${deliveryHours} Hours`,
      shippingFee: 0,
      hub: config.hubName,
      conditions,
      explanation: `Verified eligible for 24-Hour Express doorstep delivery in ${zone.areaName}, Raipur.`,
    };
  }

  // Admin zone methods
  static async getAllZones() {
    await this.seedDefaultPincodes();
    return await DeliveryZone.find().sort({ pincode: 1 }).lean();
  }

  static async createZone(data) {
    const newZone = new DeliveryZone(data);
    return await newZone.save();
  }

  static async updateZone(id, data) {
    return await DeliveryZone.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  static async toggleZoneStatus(id) {
    const zone = await DeliveryZone.findById(id);
    if (!zone) throw new Error('Delivery zone not found');
    zone.isActive = !zone.isActive;
    return await zone.save();
  }

  static async deleteZone(id) {
    return await DeliveryZone.findByIdAndDelete(id);
  }
}
