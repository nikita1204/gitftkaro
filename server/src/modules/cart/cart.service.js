import crypto from 'crypto';
import { Cart } from './cart.model.js';
import { Product } from '../products/product.model.js';
import { PricingService } from '../customizations/pricing.service.js';
import { DeliveryService } from '../delivery/delivery.service.js';

export class CartService {
  /**
   * Helper to retrieve or create a cart for a user or guest.
   */
  static async getOrCreateCart({ userId = null, guestToken = null }) {
    let cart = null;

    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestToken) {
      cart = await Cart.findOne({ guestToken });
    }

    if (!cart) {
      const generatedGuestToken = guestToken || crypto.randomUUID();
      cart = new Cart({
        user: userId || null,
        guestToken: userId ? null : generatedGuestToken,
        items: [],
      });
      await cart.save();
    }

    return await this.revalidateCart(cart);
  }

  /**
   * Revalidates live product availability, pricing, plus-size surcharges, and volume discounts.
   * Never trusts client-submitted prices or stale data.
   */
  static async revalidateCart(cart) {
    const warnings = [];
    const revalidatedItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product).populate('category', 'name slug');

      if (!product || product.isArchived || !product.isActive) {
        item.revalidation = {
          isAvailable: false,
          hasPriceChanged: false,
          previousBasePrice: item.pricing?.basePricePerUnit || 0,
          currentBasePrice: null,
          warningMessage: 'This product is currently out of stock or no longer available.',
        };
        warnings.push(`An item in your cart is currently unavailable.`);
        revalidatedItems.push(item);
        continue;
      }

      // Check if product base price changed
      const previousPrice = item.pricing?.basePricePerUnit;
      const currentPrice = product.basePrice;
      const hasPriceChanged = typeof previousPrice === 'number' && previousPrice !== currentPrice;

      if (hasPriceChanged) {
        warnings.push(
          `Price for "${product.name}" was updated from ₹${previousPrice} to ₹${currentPrice}/pc.`
        );
      }

      // Recompute verified pricing from latest base price and size breakdown
      const freshPricing = PricingService.calculatePrice({
        basePrice: product.basePrice,
        sizeBreakdown: item.sizeBreakdown,
        printLocations: item.printLocations,
      });

      item.totalQuantity = freshPricing.totalQuantity;
      item.sizeBreakdown = freshPricing.sizeBreakdown;
      item.pricing = {
        basePricePerUnit: freshPricing.basePricePerUnit,
        garmentSubtotal: freshPricing.garmentSubtotal,
        sizeSurchargeSubtotal: freshPricing.sizeSurchargeSubtotal,
        subtotal: freshPricing.subtotal,
        discountPercent: freshPricing.discountTier.discountPercent,
        discountAmount: freshPricing.discountAmount,
        totalPrice: freshPricing.totalPrice,
        effectivePricePerPiece: freshPricing.effectivePricePerPiece,
        currency: freshPricing.currency,
      };

      item.revalidation = {
        isAvailable: true,
        hasPriceChanged,
        previousBasePrice: hasPriceChanged ? previousPrice : null,
        currentBasePrice: currentPrice,
        warningMessage: hasPriceChanged
          ? `Price adjusted from ₹${previousPrice} to current rate ₹${currentPrice}/pc.`
          : '',
      };

      revalidatedItems.push(item);
    }

    cart.items = revalidatedItems;

    // Calculate Cart Totals
    const availableItems = cart.items.filter((i) => i.revalidation.isAvailable);
    const totalItems = availableItems.length;
    const totalQuantity = availableItems.reduce((sum, i) => sum + i.totalQuantity, 0);
    const garmentSubtotal = availableItems.reduce((sum, i) => sum + i.pricing.garmentSubtotal, 0);
    const sizeSurchargeSubtotal = availableItems.reduce(
      (sum, i) => sum + i.pricing.sizeSurchargeSubtotal,
      0
    );
    const subtotal = availableItems.reduce((sum, i) => sum + i.pricing.subtotal, 0);
    const totalDiscount = availableItems.reduce((sum, i) => sum + i.pricing.discountAmount, 0);
    const finalTotal = availableItems.reduce((sum, i) => sum + i.pricing.totalPrice, 0);

    const isMoqSatisfied = availableItems.every((i) => i.totalQuantity >= 10);
    const canProceedToCheckout =
      totalItems > 0 && isMoqSatisfied && availableItems.length === cart.items.length;

    cart.summary = {
      totalItems,
      totalQuantity,
      garmentSubtotal,
      sizeSurchargeSubtotal,
      subtotal,
      totalDiscount,
      estimatedShipping: 0, // Free 24h express delivery in Raipur
      estimatedDeliveryHours: 24,
      finalTotal,
      currency: 'INR',
      isMoqSatisfied,
      canProceedToCheckout,
      warnings,
    };

    await cart.save();

    // Populate products for client UI
    return await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images basePrice compareAtPrice availableColors category isExpressEligible',
    });
  }

  /**
   * Add a customized t-shirt order configuration to cart.
   */
  static async addItem({ userId = null, guestToken = null, itemData }) {
    const product = await Product.findById(itemData.productId);
    if (!product || product.isArchived || !product.isActive) {
      const error = new Error('Product not found or unavailable');
      error.statusCode = 404;
      throw error;
    }

    // Verify and calculate price on the server
    const verifiedPricing = PricingService.calculatePrice({
      basePrice: product.basePrice,
      sizeBreakdown: itemData.sizeBreakdown,
      printLocations: itemData.printLocations || ['front_chest'],
    });

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestToken) {
      cart = await Cart.findOne({ guestToken });
    }

    if (!cart) {
      const token = guestToken || crypto.randomUUID();
      cart = new Cart({
        user: userId || null,
        guestToken: userId ? null : token,
        items: [],
      });
    }

    const newItem = {
      product: product._id,
      customization: itemData.customizationId || null,
      orderType: itemData.orderType || 'group',
      selectedColor: itemData.selectedColor,
      sizeBreakdown: verifiedPricing.sizeBreakdown,
      totalQuantity: verifiedPricing.totalQuantity,
      printLocations: itemData.printLocations || ['front_chest'],
      customText: itemData.customText || '',
      printingInstructions: itemData.printingInstructions || '',
      artworks: itemData.artworks || [],
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
      revalidation: {
        isAvailable: true,
        hasPriceChanged: false,
        previousBasePrice: null,
        currentBasePrice: product.basePrice,
        warningMessage: '',
      },
    };

    cart.items.push(newItem);
    await cart.save();

    return await this.revalidateCart(cart);
  }

  /**
   * Update quantity or options of an existing cart item.
   */
  static async updateItem({ userId = null, guestToken = null, itemId, updateData }) {
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestToken) {
      cart = await Cart.findOne({ guestToken });
    }

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const item = cart.items.id(itemId);
    if (!item) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }

    const product = await Product.findById(item.product);
    if (!product || product.isArchived || !product.isActive) {
      const error = new Error('Product is no longer available');
      error.statusCode = 400;
      throw error;
    }

    // Recompute price with updated size breakdown
    const verifiedPricing = PricingService.calculatePrice({
      basePrice: product.basePrice,
      sizeBreakdown: updateData.sizeBreakdown,
      printLocations: updateData.printLocations || item.printLocations,
    });

    item.sizeBreakdown = verifiedPricing.sizeBreakdown;
    item.totalQuantity = verifiedPricing.totalQuantity;
    if (updateData.selectedColor) item.selectedColor = updateData.selectedColor;
    if (updateData.printLocations) item.printLocations = updateData.printLocations;
    if (typeof updateData.customText === 'string') item.customText = updateData.customText;
    if (typeof updateData.printingInstructions === 'string')
      item.printingInstructions = updateData.printingInstructions;

    item.pricing = {
      basePricePerUnit: verifiedPricing.basePricePerUnit,
      garmentSubtotal: verifiedPricing.garmentSubtotal,
      sizeSurchargeSubtotal: verifiedPricing.sizeSurchargeSubtotal,
      subtotal: verifiedPricing.subtotal,
      discountPercent: verifiedPricing.discountTier.discountPercent,
      discountAmount: verifiedPricing.discountAmount,
      totalPrice: verifiedPricing.totalPrice,
      effectivePricePerPiece: verifiedPricing.effectivePricePerPiece,
      currency: verifiedPricing.currency,
    };

    await cart.save();
    return await this.revalidateCart(cart);
  }

  /**
   * Remove a single item from the cart.
   */
  static async removeItem({ userId = null, guestToken = null, itemId }) {
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestToken) {
      cart = await Cart.findOne({ guestToken });
    }

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    return await this.revalidateCart(cart);
  }

  /**
   * Clear all items from cart.
   */
  static async clearCart({ userId = null, guestToken = null }) {
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestToken) {
      cart = await Cart.findOne({ guestToken });
    }

    if (cart) {
      cart.items = [];
      cart.summary = {
        totalItems: 0,
        totalQuantity: 0,
        garmentSubtotal: 0,
        sizeSurchargeSubtotal: 0,
        subtotal: 0,
        totalDiscount: 0,
        estimatedShipping: 0,
        estimatedDeliveryHours: 24,
        finalTotal: 0,
        currency: 'INR',
        isMoqSatisfied: true,
        canProceedToCheckout: false,
        warnings: [],
      };
      await cart.save();
    }

    return cart;
  }

  /**
   * Merge guest cart into user cart upon login.
   */
  static async mergeGuestCart({ userId, guestToken }) {
    if (!userId || !guestToken) return;

    const guestCart = await Cart.findOne({ guestToken });
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    for (const item of guestCart.items) {
      userCart.items.push(item);
    }

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });

    return await this.revalidateCart(userCart);
  }

  /**
   * Prepare checkout: revalidates cart, validates shipping address, computes delivery timeline.
   * Does NOT confirm order or charge payment.
   */
  static async prepareCheckout({ userId = null, guestToken = null, checkoutData }) {
    const cart = await this.getOrCreateCart({ userId, guestToken });

    if (!cart.items || cart.items.length === 0) {
      const error = new Error('Your cart is empty. Please add items before proceeding to checkout.');
      error.statusCode = 400;
      throw error;
    }

    if (!cart.summary.isMoqSatisfied) {
      const error = new Error(
        'One or more customized t-shirt configurations in your cart do not satisfy the minimum order quantity of 10 pieces.'
      );
      error.statusCode = 400;
      throw error;
    }

    const hasUnavailable = cart.items.some((i) => !i.revalidation.isAvailable);
    if (hasUnavailable) {
      const error = new Error(
        'Your cart contains items that are currently unavailable. Please remove them before checkout.'
      );
      error.statusCode = 400;
      throw error;
    }

    const checkoutId = `GK-CHECKOUT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const now = new Date();
    // Validate delivery eligibility and estimated window dynamically
    const hasArtwork = cart.items.every(
      (item) => item.artworks && item.artworks.length > 0
    );
    const deliveryEligibility = await DeliveryService.checkEligibility({
      pincode: checkoutData.shippingAddress.pincode,
      totalQuantity: cart.summary.totalQuantity,
      hasArtwork,
      orderPlacedAt: now,
    });

    const checkoutSummary = {
      checkoutId,
      preparedAt: now,
      status: 'prepared',
      canProceedToPayment: true,
      contact: checkoutData.contact,
      shippingAddress: checkoutData.shippingAddress,
      deliveryEstimate: {
        is24hEligible: deliveryEligibility.is24hEligible,
        status: deliveryEligibility.status,
        guaranteedHours: deliveryEligibility.deliveryHours || (deliveryEligibility.is24hEligible ? 24 : 72),
        estimatedDeliveryDate: deliveryEligibility.estimatedDeliveryDate || null,
        estimatedDeliveryWindow: deliveryEligibility.estimatedDeliveryWindow,
        dispatchWindow: deliveryEligibility.is24hEligible
          ? 'Dispatches within 24 hours of final order placement'
          : deliveryEligibility.status === 'capacity_exceeded'
          ? 'Dispatches within 48–72 hours due to high-volume bulk curing'
          : 'Dispatches via standard courier transit (3–5 days)',
        hub: deliveryEligibility.hub || 'Raipur Express Printing Facility, Chhattisgarh',
        expressEligible: deliveryEligibility.is24hEligible,
        reason: deliveryEligibility.reason || '',
        explanation: deliveryEligibility.explanation || '',
        conditions: deliveryEligibility.conditions || [],
        shippingFee: deliveryEligibility.shippingFee || 0,
        shippingType: deliveryEligibility.is24hEligible
          ? '24-Hour Raipur Express Doorstep Delivery'
          : 'Standard Courier Delivery',
      },
      items: cart.items.map((item) => ({
        itemId: item._id,
        productId: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.images?.[0]?.url || '',
        orderType: item.orderType,
        selectedColor: item.selectedColor,
        sizeBreakdown: item.sizeBreakdown,
        totalQuantity: item.totalQuantity,
        printLocations: item.printLocations,
        customText: item.customText,
        pricing: item.pricing,
      })),
      pricingSummary: {
        totalItems: cart.summary.totalItems,
        totalQuantity: cart.summary.totalQuantity,
        garmentSubtotal: cart.summary.garmentSubtotal,
        sizeSurchargeSubtotal: cart.summary.sizeSurchargeSubtotal,
        subtotal: cart.summary.subtotal,
        totalDiscount: cart.summary.totalDiscount,
        shippingFee: 0,
        finalTotal: cart.summary.finalTotal,
        currency: 'INR',
      },
      nextStep: {
        readyForPayment: false,
        message: 'Checkout preparation verified. Payment and order creation reserved for Step 5.',
      },
    };

    return checkoutSummary;
  }
}
