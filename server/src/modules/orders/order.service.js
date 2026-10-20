import crypto from 'crypto';
import { Order } from './order.model.js';
import { Cart } from '../cart/cart.model.js';
import { CartService } from '../cart/cart.service.js';
import { DeliveryService } from '../delivery/delivery.service.js';
import { PaymentService } from '../payments/payment.service.js';
import { AuditLogService } from '../audit/auditLog.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// Strict state transition machine for orders
export const VALID_ORDER_STATUS_TRANSITIONS = {
  pending_payment: ['confirmed', 'payment_failed', 'cancelled'],
  payment_failed: ['pending_payment', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['quality_check', 'cancelled'],
  quality_check: ['dispatched', 'in_production'],
  dispatched: ['delivered'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

export class OrderService {
  /**
   * Create an official GIFT KRO order from verified server-side cart items.
   */
  static async createOrderFromCart({ userId = null, guestToken = null, orderData, _req = null }) {
    // 1. Idempotency safeguard: check if order already exists with given idempotencyKey
    if (orderData.idempotencyKey) {
      const existing = await Order.findOne({ 'payment.idempotencyKey': orderData.idempotencyKey });
      if (existing) {
        logger.info(`Idempotent order request detected for key: ${orderData.idempotencyKey}`);
        return {
          order: existing,
          razorpayOrder: {
            id: existing.payment.razorpayOrderId,
            amount: existing.pricingSummary.finalTotal * 100,
            currency: 'INR',
          },
          keyId: env.RAZORPAY_KEY_ID,
          isDuplicate: true,
        };
      }
    }

    // 2. Fetch and strictly revalidate server-side cart
    const cart = await CartService.getOrCreateCart({ userId, guestToken });

    if (!cart.items || cart.items.length === 0) {
      const err = new Error('Cart is empty. Please add customized t-shirts before creating an order.');
      err.statusCode = 400;
      throw err;
    }

    if (!cart.summary.isMoqSatisfied) {
      const err = new Error('Each custom t-shirt configuration must have at least 10 pieces (MOQ).');
      err.statusCode = 400;
      throw err;
    }

    const hasUnavailable = cart.items.some((item) => !item.revalidation?.isAvailable);
    if (hasUnavailable) {
      const err = new Error('One or more items in your cart are currently unavailable.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Compute verified delivery eligibility dynamically
    const hasArtwork = cart.items.every(
      (item) => item.artworks && item.artworks.length > 0
    );

    const deliveryEstimate = await DeliveryService.checkEligibility({
      pincode: orderData.shippingAddress.pincode,
      totalQuantity: cart.summary.totalQuantity,
      hasArtwork,
      orderPlacedAt: new Date(),
    });

    // 4. Generate unique serial order number: GK-ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `GK-ORD-${dateStr}-${randomSuffix}`;

    // 5. Create Razorpay order on server
    const razorpayOrder = await PaymentService.createOrder({
      amount: cart.summary.finalTotal,
      receipt: orderNumber,
      notes: {
        orderNumber,
        customerName: orderData.contact.name,
        customerPhone: orderData.contact.phone,
        pincode: orderData.shippingAddress.pincode,
      },
    });

    // 6. Map verified cart items into Order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.images?.[0]?.url || '',
      orderType: item.orderType,
      selectedColor: item.selectedColor,
      sizeBreakdown: item.sizeBreakdown,
      totalQuantity: item.totalQuantity,
      printLocations: item.printLocations,
      customText: item.customText || '',
      printingInstructions: item.printingInstructions || '',
      artworks: (item.artworks || []).map((art) => ({
        filename: art.filename,
        originalName: art.originalName,
        mimetype: art.mimetype,
        size: art.size,
        url: art.url,
        approvalStatus: 'pending',
      })),
      pricing: item.pricing,
    }));

    // 7. Persist Order document
    const newOrder = new Order({
      orderNumber,
      user: userId || null,
      contact: orderData.contact,
      shippingAddress: orderData.shippingAddress,
      deliveryEstimate: {
        is24hEligible: deliveryEstimate.is24hEligible,
        status: deliveryEstimate.status,
        guaranteedHours: deliveryEstimate.deliveryHours || (deliveryEstimate.is24hEligible ? 24 : 72),
        estimatedDeliveryDate: deliveryEstimate.estimatedDeliveryDate || null,
        estimatedDeliveryWindow: deliveryEstimate.estimatedDeliveryWindow,
        dispatchWindow: deliveryEstimate.is24hEligible
          ? 'Dispatches within 24 hours of confirmation'
          : 'Dispatches in 48–72 hours via standard transit',
        hub: deliveryEstimate.hub,
        conditions: deliveryEstimate.conditions || [],
        shippingFee: deliveryEstimate.shippingFee || 0,
        shippingType: deliveryEstimate.is24hEligible
          ? '24-Hour Raipur Express Doorstep Delivery'
          : 'Standard Courier Transit',
      },
      items: orderItems,
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
      payment: {
        provider: 'razorpay',
        status: 'pending',
        razorpayOrderId: razorpayOrder.id,
        idempotencyKey: orderData.idempotencyKey || null,
      },
      orderStatus: 'pending_payment',
      statusHistory: [
        {
          status: 'pending_payment',
          changedByName: 'Checkout Engine',
          timestamp: new Date(),
          comment: `Order initiated for ${cart.summary.totalQuantity} custom garments. Awaiting payment authorization.`,
        },
      ],
    });

    await newOrder.save();

    // 8. Clear cart upon successful order preparation
    await Cart.findByIdAndDelete(cart._id);

    return {
      order: newOrder,
      razorpayOrder,
      keyId: env.RAZORPAY_KEY_ID,
      isDuplicate: false,
    };
  }

  /**
   * Verify Razorpay Payment Signature and confirm order.
   * Enforces idempotency to prevent duplicate callbacks or charges.
   */
  static async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });

    if (!order) {
      const err = new Error(`Order with payment ID ${razorpayOrderId} not found.`);
      err.statusCode = 404;
      throw err;
    }

    // Idempotency: If already confirmed and payment captured, return immediately
    if (order.payment.status === 'captured' && order.orderStatus !== 'pending_payment') {
      logger.info(`Duplicate payment verification received for Order #${order.orderNumber}. Returning existing record.`);
      return order;
    }

    // Cryptographic signature check
    const isValid = PaymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      // Record failed payment attempt
      order.payment.status = 'failed';
      order.payment.failureReason = 'Cryptographic signature mismatch';
      order.orderStatus = 'payment_failed';
      order.statusHistory.push({
        status: 'payment_failed',
        changedByName: 'Security Gateway',
        timestamp: new Date(),
        comment: 'Invalid payment signature. Verification rejected.',
      });
      await order.save();

      const err = new Error('Invalid payment signature. Payment authenticity could not be verified.');
      err.statusCode = 400;
      throw err;
    }

    // Mark as paid and confirmed
    order.payment.status = 'captured';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.amountPaid = order.pricingSummary.finalTotal;
    order.payment.paidAt = new Date();
    order.payment.failureReason = null;
    order.orderStatus = 'confirmed';

    order.statusHistory.push({
      status: 'confirmed',
      changedByName: 'Razorpay Gateway',
      timestamp: new Date(),
      comment: `Payment of ₹${order.pricingSummary.finalTotal.toLocaleString('en-IN')} verified & captured. Production slot confirmed.`,
    });

    await order.save();
    logger.info(`Order #${order.orderNumber} successfully paid and confirmed!`);
    return order;
  }

  /**
   * Handle payment failure / cancellation from client checkout modal.
   */
  static async handlePaymentFailure({ razorpayOrderId, failureReason = 'Customer cancelled or gateway error' }) {
    const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
    if (!order) return null;

    if (order.payment.status === 'captured') {
      // Do not overwrite already captured payments
      return order;
    }

    order.payment.status = 'failed';
    order.payment.failureReason = failureReason;
    order.orderStatus = 'payment_failed';
    order.statusHistory.push({
      status: 'payment_failed',
      changedByName: 'Payment Gateway',
      timestamp: new Date(),
      comment: `Payment failed: ${failureReason}`,
    });

    await order.save();
    return order;
  }

  /**
   * Update order status with strict transition validation (Admin only).
   */
  static async updateOrderStatus({ orderId, newStatus, comment = '', adminUser, req = null }) {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = order.orderStatus;

    if (currentStatus === newStatus) {
      return order;
    }

    // Validate state transition against business rules
    const allowedNextStatuses = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      const err = new Error(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions are: [${allowedNextStatuses.join(', ') || 'None (Terminal state)'}]`
      );
      err.statusCode = 400;
      throw err;
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      changedBy: adminUser?._id,
      changedByName: adminUser?.name || adminUser?.email || 'Admin',
      timestamp: new Date(),
      comment: comment || `Status updated from "${currentStatus}" to "${newStatus}"`,
    });

    await order.save();

    // Record audit log
    await AuditLogService.logAction({
      action: 'ORDER_STATUS_UPDATE',
      admin: adminUser,
      targetEntity: 'Order',
      targetId: order._id,
      details: {
        orderNumber: order.orderNumber,
        previousStatus: currentStatus,
        newStatus,
        comment,
      },
      req,
    });

    return order;
  }

  /**
   * Update artwork approval status (Admin only).
   */
  static async updateArtworkStatus({
    orderId,
    itemId,
    artworkId,
    approvalStatus,
    reviewNotes = '',
    adminUser,
    req = null,
  }) {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const item = order.items.id(itemId);
    if (!item) {
      const err = new Error('Order item not found');
      err.statusCode = 404;
      throw err;
    }

    const artwork = item.artworks.id(artworkId);
    if (!artwork) {
      const err = new Error('Artwork file not found');
      err.statusCode = 404;
      throw err;
    }

    const previousStatus = artwork.approvalStatus;
    artwork.approvalStatus = approvalStatus;
    artwork.reviewNotes = reviewNotes;
    artwork.reviewedBy = adminUser?._id || null;
    artwork.reviewedAt = new Date();

    await order.save();

    // Record audit log
    await AuditLogService.logAction({
      action: 'ARTWORK_STATUS_UPDATE',
      admin: adminUser,
      targetEntity: 'Order',
      targetId: order._id,
      details: {
        orderNumber: order.orderNumber,
        artworkFilename: artwork.filename,
        previousStatus,
        newStatus: approvalStatus,
        reviewNotes,
      },
      req,
    });

    return order;
  }

  /**
   * Query orders for administrator dashboard with filters, search, and pagination.
   */
  static async getOrdersAdmin({
    page = 1,
    limit = 15,
    status = null,
    search = '',
    isExpress = null,
    sort = 'newest',
  }) {
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (typeof isExpress === 'boolean') {
      query['deliveryEstimate.is24hEligible'] = isExpress;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { orderNumber: { $regex: term, $options: 'i' } },
        { 'contact.name': { $regex: term, $options: 'i' } },
        { 'contact.email': { $regex: term, $options: 'i' } },
        { 'contact.phone': { $regex: term, $options: 'i' } },
        { 'shippingAddress.areaLocality': { $regex: term, $options: 'i' } },
        { 'shippingAddress.pincode': { $regex: term, $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'amount_desc') sortObj = { 'pricingSummary.finalTotal': -1 };
    if (sort === 'amount_asc') sortObj = { 'pricingSummary.finalTotal': 1 };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role')
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single order by ID or orderNumber.
   */
  static async getOrderById(orderIdOrNumber) {
    let order = null;
    if (orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderIdOrNumber)
        .populate('user', 'name email')
        .populate('statusHistory.changedBy', 'name email')
        .lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderIdOrNumber })
        .populate('user', 'name email')
        .populate('statusHistory.changedBy', 'name email')
        .lean();
    }

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    return order;
  }

  /**
   * Get orders for customer account history.
   */
  static async getCustomerOrders({ userId = null, email = null }) {
    const query = {};
    if (userId) {
      query.user = userId;
    } else if (email) {
      query['contact.email'] = email.toLowerCase().trim();
    } else {
      return [];
    }

    return await Order.find(query).sort({ createdAt: -1 }).lean();
  }
}
