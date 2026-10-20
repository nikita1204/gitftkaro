import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { OrderService } from './order.service.js';

export class OrderController {
  /**
   * Create an official order from verified cart and prepare Razorpay payment.
   * POST /api/v1/orders
   */
  static createOrder = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = req.cookies?.guest_cart_token || req.headers['x-cart-token'] || null;

    const result = await OrderService.createOrderFromCart({
      userId,
      guestToken,
      orderData: req.body,
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Order created and payment session initialized successfully',
      data: result,
    });
  });

  /**
   * Verify Razorpay cryptographic payment signature and confirm order.
   * POST /api/v1/orders/verify-payment
   */
  static verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await OrderService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Payment verified successfully. Order confirmed for 24-hour express production!',
      data: order,
    });
  });

  /**
   * Report payment failure from client checkout modal.
   * POST /api/v1/orders/payment-failed
   */
  static paymentFailure = asyncHandler(async (req, res) => {
    const { razorpayOrderId, failureReason } = req.body;

    const order = await OrderService.handlePaymentFailure({
      razorpayOrderId,
      failureReason,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Payment failure recorded',
      data: order,
    });
  });

  /**
   * Development sandbox simulation: generates valid cryptographic HMAC-SHA256 signature and confirms order.
   * POST /api/v1/orders/simulate-test-payment
   */
  static simulateTestPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await OrderService.getOrderById(orderId);
    const mockPaymentId = `pay_sandbox_${Date.now()}`;
    const validSignature = (await import('../payments/payment.service.js')).PaymentService.generateTestSignature(
      order.payment.razorpayOrderId,
      mockPaymentId
    );

    const confirmedOrder = await OrderService.verifyPayment({
      razorpayOrderId: order.payment.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: validSignature,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Test payment simulated & cryptographically verified successfully!',
      data: confirmedOrder,
    });
  });

  /**
   * Get single order by ID or orderNumber for tracking.
   * GET /api/v1/orders/:idOrNumber
   */
  static getOrderDetails = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.idOrNumber);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Order details retrieved successfully',
      data: order,
    });
  });

  /**
   * Get authenticated customer's order history.
   * GET /api/v1/orders/my-orders
   */
  static getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const email = req.user?.email;

    const orders = await OrderService.getCustomerOrders({ userId, email });
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Customer orders retrieved successfully',
      data: orders,
    });
  });

  /**
   * Administrator: Query orders with search, filters, and pagination.
   * GET /api/v1/orders/admin/all
   */
  static adminGetOrders = asyncHandler(async (req, res) => {
    const { page, limit, status, search, isExpress, sort } = req.query;

    const result = await OrderService.getOrdersAdmin({
      page,
      limit,
      status,
      search,
      isExpress,
      sort,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Admin orders retrieved successfully',
      data: result,
    });
  });

  /**
   * Administrator: Update order status with valid transition rules.
   * PATCH /api/v1/orders/:id/status
   */
  static adminUpdateStatus = asyncHandler(async (req, res) => {
    const { orderStatus, comment } = req.body;

    const updatedOrder = await OrderService.updateOrderStatus({
      orderId: req.params.id,
      newStatus: orderStatus,
      comment,
      adminUser: req.user,
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: `Order status successfully transitioned to "${orderStatus}"`,
      data: updatedOrder,
    });
  });

  /**
   * Administrator: Review customer uploaded artwork / design proof.
   * PATCH /api/v1/orders/:id/items/:itemId/artworks/:artworkId
   */
  static adminUpdateArtwork = asyncHandler(async (req, res) => {
    const { approvalStatus, reviewNotes } = req.body;

    const updatedOrder = await OrderService.updateArtworkStatus({
      orderId: req.params.id,
      itemId: req.params.itemId,
      artworkId: req.params.artworkId,
      approvalStatus,
      reviewNotes,
      adminUser: req.user,
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: `Artwork approval status updated to "${approvalStatus}"`,
      data: updatedOrder,
    });
  });
}
