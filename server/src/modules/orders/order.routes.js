import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth.js';
import {
  createOrderSchema,
  verifyPaymentSchema,
  updateOrderStatusSchema,
  updateArtworkStatusSchema,
  orderQuerySchema,
} from './order.validator.js';

const router = Router();

/**
 * Public & Customer Order Routes
 */

// Create order from cart and prepare payment
router.post(
  '/',
  optionalAuthenticate,
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

// Verify Razorpay payment signature
router.post(
  '/verify-payment',
  optionalAuthenticate,
  validateRequest(verifyPaymentSchema),
  OrderController.verifyPayment
);

// Record payment failure from modal
router.post(
  '/payment-failed',
  optionalAuthenticate,
  OrderController.paymentFailure
);

// Development Sandbox: simulate verified payment with real cryptographic signature
router.post(
  '/simulate-test-payment',
  optionalAuthenticate,
  OrderController.simulateTestPayment
);

// Customer order history
router.get(
  '/my-orders',
  authenticate,
  OrderController.getMyOrders
);

// Order tracking & details by ID or orderNumber
router.get(
  '/:idOrNumber',
  optionalAuthenticate,
  OrderController.getOrderDetails
);

/**
 * Administrator Protected Routes (Require role: 'admin')
 */

// List all orders with filters, search, and pagination
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  validateRequest(orderQuerySchema),
  OrderController.adminGetOrders
);

// Update order status with transition rules enforcement
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateRequest(updateOrderStatusSchema),
  OrderController.adminUpdateStatus
);

// Review and approve / flag customer artwork
router.patch(
  '/:id/items/:itemId/artworks/:artworkId',
  authenticate,
  authorize('admin'),
  validateRequest(updateArtworkStatusSchema),
  OrderController.adminUpdateArtwork
);

export default router;
