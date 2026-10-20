import { PRICING_CONFIG } from './pricing.config.js';

/**
 * GIFT KRO — Server-Side Pricing Engine
 * Computes strictly verified customization prices based on product base price,
 * size breakdown, and volume discount tiers. Never trusts browser totals.
 */
export class PricingService {
  /**
   * Determine the applicable volume discount tier for a given quantity.
   * @param {number} totalQuantity
   * @returns {{ minQty: number, discountPercent: number, label: string, badge: string }}
   */
  static getVolumeDiscountTier(totalQuantity) {
    for (const tier of PRICING_CONFIG.volumeDiscountTiers) {
      if (totalQuantity >= tier.minQty) {
        return tier;
      }
    }
    return {
      minQty: PRICING_CONFIG.minOrderQuantity,
      discountPercent: 0,
      label: 'Below MOQ',
      badge: 'Minimum 10 pcs required',
    };
  }

  /**
   * Calculate complete price breakdown for a customization request.
   * @param {Object} params
   * @param {number} params.basePrice - Product base price per unit from database
   * @param {Array<{ size: string, quantity: number }>} params.sizeBreakdown - List of sizes and counts
   * @param {Array<string>} [params.printLocations] - Selected print locations
   * @returns {Object} Complete verified price breakdown
   */
  static calculatePrice({ basePrice, sizeBreakdown, printLocations = [] }) {
    if (typeof basePrice !== 'number' || basePrice <= 0) {
      throw new Error('Valid product base price is required for pricing calculation');
    }

    if (!Array.isArray(sizeBreakdown) || sizeBreakdown.length === 0) {
      throw new Error('Size breakdown must contain at least one size with quantity');
    }

    let totalQuantity = 0;
    let sizeSurchargeSubtotal = 0;
    const verifiedSizeBreakdown = [];

    for (const item of sizeBreakdown) {
      const sizeKey = String(item.size).toUpperCase().trim();
      const quantity = Math.floor(Number(item.quantity) || 0);

      if (quantity < 0) {
        throw new Error(`Quantity for size ${sizeKey} cannot be negative`);
      }

      if (quantity > 0) {
        const surchargePerUnit = PRICING_CONFIG.sizeSurcharges[sizeKey] ?? 0;
        const totalSurcharge = surchargePerUnit * quantity;

        totalQuantity += quantity;
        sizeSurchargeSubtotal += totalSurcharge;

        verifiedSizeBreakdown.push({
          size: sizeKey,
          quantity,
          surchargePerUnit,
          totalSurcharge,
        });
      }
    }

    if (totalQuantity < PRICING_CONFIG.minOrderQuantity) {
      const error = new Error(
        `Minimum order quantity for custom T-shirts is ${PRICING_CONFIG.minOrderQuantity} pieces. You currently have ${totalQuantity} pieces.`
      );
      error.statusCode = 400;
      error.name = 'ValidationError';
      error.details = {
        minOrderQuantity: PRICING_CONFIG.minOrderQuantity,
        currentQuantity: totalQuantity,
        difference: PRICING_CONFIG.minOrderQuantity - totalQuantity,
      };
      throw error;
    }

    // Garment base subtotal
    const garmentSubtotal = basePrice * totalQuantity;

    // Subtotal before discounts
    const subtotal = garmentSubtotal + sizeSurchargeSubtotal;

    // Volume discount
    const discountTier = this.getVolumeDiscountTier(totalQuantity);
    const discountAmount = Math.round(subtotal * (discountTier.discountPercent / 100));

    // Final total
    const totalPrice = subtotal - discountAmount;
    const effectivePricePerPiece = Math.round(totalPrice / totalQuantity);

    return {
      basePricePerUnit: basePrice,
      totalQuantity,
      sizeBreakdown: verifiedSizeBreakdown,
      printLocationsCount: printLocations.length,
      garmentSubtotal,
      sizeSurchargeSubtotal,
      subtotal,
      discountTier: {
        minQty: discountTier.minQty,
        discountPercent: discountTier.discountPercent,
        label: discountTier.label,
        badge: discountTier.badge,
      },
      discountAmount,
      totalPrice,
      effectivePricePerPiece,
      currency: PRICING_CONFIG.currency,
      currencySymbol: PRICING_CONFIG.currencySymbol,
      minOrderQuantityMet: true,
      turnaroundHours: 24,
    };
  }
}
