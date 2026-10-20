/**
 * GIFT KRO — Configurable Pricing & Customization Rules
 * Business decisions configured per specification:
 * - Minimum Order Quantity: 10 pieces
 * - Base price covers all selected print locations (no location surcharges)
 * - Size surcharges: Standard (XS-XL) = ₹0, Plus sizes (2XL, 3XL, 4XL) = ₹30/piece
 * - Volume Discount Tiers:
 *     100+ pcs : 15% discount
 *     50-99 pcs: 10% discount
 *     25-49 pcs:  5% discount
 *     10-24 pcs:  0% discount
 */

export const PRICING_CONFIG = {
  minOrderQuantity: 10,
  maxOrderQuantity: 10000,
  currency: 'INR',
  currencySymbol: '₹',

  // Surcharges per unit by size
  sizeSurcharges: {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    '2XL': 30,
    '3XL': 30,
    '4XL': 30,
  },

  // Additional fee per extra print location (configured to 0 as base covers all)
  printLocationCharge: 0,

  // Allowed print location keys
  allowedPrintLocations: [
    { id: 'front_chest', label: 'Front Left Chest (Logo / Badge)', icon: 'badge' },
    { id: 'full_front', label: 'Full Front Chest (Graphic / Banner)', icon: 'layout' },
    { id: 'back_top', label: 'Upper Back / Neck (Name / Tagline)', icon: 'align-top' },
    { id: 'full_back', label: 'Full Back (Artwork / Numbering)', icon: 'maximize' },
    { id: 'left_sleeve', label: 'Left Sleeve (Badge / Flag)', icon: 'shield' },
    { id: 'right_sleeve', label: 'Right Sleeve (Partner / URL)', icon: 'link' },
  ],

  // Volume discount tiers (evaluated highest minQty to lowest)
  volumeDiscountTiers: [
    {
      minQty: 100,
      discountPercent: 15,
      label: 'Mega Bulk Tier (100+ pcs)',
      badge: '15% OFF Bulk Saving',
    },
    {
      minQty: 50,
      discountPercent: 10,
      label: 'Wholesale Tier (50–99 pcs)',
      badge: '10% OFF Volume Saving',
    },
    {
      minQty: 25,
      discountPercent: 5,
      label: 'Team Tier (25–49 pcs)',
      badge: '5% OFF Team Saving',
    },
    {
      minQty: 10,
      discountPercent: 0,
      label: 'Standard Tier (10–24 pcs)',
      badge: 'MOQ Satisfied',
    },
  ],

  // Supported order categories
  orderTypes: [
    { id: 'individual', label: 'Personalized / Milestone', turnaroundHours: 24 },
    { id: 'group', label: 'Group / Reunion / Club', turnaroundHours: 24 },
    { id: 'event', label: 'Event / Marathon / College Fest', turnaroundHours: 24 },
    { id: 'corporate', label: 'Corporate / Startup Workwear', turnaroundHours: 24 },
  ],
};
