import { Customization } from './customization.model.js';
import { Product } from '../products/product.model.js';
import { PricingService } from './pricing.service.js';

export class CustomizationService {
  /**
   * Calculate verified price quote for a customization draft.
   */
  static async calculateQuote({ productId, sizeBreakdown, printLocations = [], selectedColor }) {
    const product = await Product.findById(productId).populate('category', 'name slug');

    if (!product || product.isArchived || !product.isActive) {
      const error = new Error('Selected product is currently unavailable or inactive.');
      error.statusCode = 404;
      throw error;
    }

    const pricing = PricingService.calculatePrice({
      basePrice: product.basePrice,
      sizeBreakdown,
      printLocations,
    });

    return {
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        imageUrl: product.images?.[0]?.url || '',
        category: product.category?.name || 'Customized T-shirts',
        minOrderQuantity: product.minOrderQuantity || 10,
        availableSizes: product.availableSizes,
        availableColors: product.availableColors,
      },
      selectedColor: selectedColor || product.availableColors?.[0] || null,
      pricing,
    };
  }

  /**
   * Persist a full customization specification with server-calculated price lock.
   */
  static async createCustomization(data, userId = null) {
    const product = await Product.findById(data.productId).populate('category', 'name');

    if (!product || product.isArchived || !product.isActive) {
      const error = new Error('Product not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    // Always calculate price on server — never trust client totals!
    const verifiedPricing = PricingService.calculatePrice({
      basePrice: product.basePrice,
      sizeBreakdown: data.sizeBreakdown,
      printLocations: data.printLocations,
    });

    // Generate unique human-readable customization code
    let customizationCode = Customization.generateCustomizationCode();
    let codeExists = await Customization.findOne({ customizationCode });
    while (codeExists) {
      customizationCode = Customization.generateCustomizationCode();
      codeExists = await Customization.findOne({ customizationCode });
    }

    const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';

    const newCustomization = new Customization({
      customizationCode,
      user: userId,
      product: product._id,
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        imageUrl: primaryImage,
        categoryName: product.category?.name || 'Customized T-shirts',
      },
      orderType: data.orderType || 'group',
      selectedColor: data.selectedColor,
      sizeBreakdown: verifiedPricing.sizeBreakdown,
      totalQuantity: verifiedPricing.totalQuantity,
      printLocations: data.printLocations || ['front_chest'],
      customText: data.customText || '',
      printingInstructions: data.printingInstructions || '',
      artworks: data.artworks || [],
      contactInfo: data.contactInfo,
      pricing: {
        basePricePerUnit: verifiedPricing.basePricePerUnit,
        garmentSubtotal: verifiedPricing.garmentSubtotal,
        sizeSurchargeSubtotal: verifiedPricing.sizeSurchargeSubtotal,
        subtotal: verifiedPricing.subtotal,
        discountPercent: verifiedPricing.discountTier.discountPercent,
        discountAmount: verifiedPricing.discountAmount,
        totalPrice: verifiedPricing.totalPrice,
        effectivePricePerPiece: verifiedPricing.effectivePricePerPiece,
        currency: verifiedPricing.currency,
      },
      status: 'submitted',
      turnaroundHours: 24,
    });

    return await newCustomization.save();
  }

  /**
   * Retrieve customization by code (e.g. GK-CUST-8F3B1A2C) or Mongo ObjectId.
   */
  static async getByCodeOrId(codeOrId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(codeOrId);
    const filter = isObjectId ? { _id: codeOrId } : { customizationCode: codeOrId.toUpperCase().trim() };

    const doc = await Customization.findOne(filter).populate('product', 'name slug images basePrice');

    if (!doc) {
      const error = new Error(`Customization not found for reference: ${codeOrId}`);
      error.statusCode = 404;
      throw error;
    }

    return doc;
  }

  /**
   * List customizations with pagination and filters (admin or user).
   */
  static async listCustomizations(queryParams, user = null) {
    const { page = 1, limit = 10, orderType, status, search } = queryParams;

    const filter = {};

    // Restrict non-admin to their own inquiries
    if (user && user.role !== 'admin') {
      filter.user = user._id;
    }

    if (orderType) {
      filter.orderType = orderType;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { customizationCode: { $regex: search, $options: 'i' } },
        { 'contactInfo.name': { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.organization': { $regex: search, $options: 'i' } },
        { customText: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Customization.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customization.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update customization status.
   */
  static async updateStatus(id, status) {
    const doc = await Customization.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!doc) {
      const error = new Error('Customization not found');
      error.statusCode = 404;
      throw error;
    }

    return doc;
  }
}
