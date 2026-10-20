import { Router } from 'express';
import { z } from 'zod';
import healthRoutes from '../../modules/health/health.routes.js';
import authRoutes from '../../modules/auth/auth.routes.js';
import productRoutes from '../../modules/products/product.routes.js';
import categoryRoutes from '../../modules/products/category.routes.js';
import customizationRoutes from '../../modules/customizations/customization.routes.js';
import cartRoutes from '../../modules/cart/cart.routes.js';
import deliveryRoutes from '../../modules/delivery/delivery.routes.js';
import orderRoutes from '../../modules/orders/order.routes.js';
import adminRoutes from '../../modules/admin/admin.routes.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { ApiResponse } from '../../utils/apiResponse.js';

const v1Router = Router();

/**
 * Authentication Module Routes
 * @route /api/v1/auth
 */
v1Router.use('/auth', authRoutes);

/**
 * Product Catalogue Routes
 * @route /api/v1/products
 */
v1Router.use('/products', productRoutes);

/**
 * Product Category Routes
 * @route /api/v1/categories
 */
v1Router.use('/categories', categoryRoutes);

/**
 * Customization & Pricing Routes
 * @route /api/v1/customizations
 */
v1Router.use('/customizations', customizationRoutes);

/**
 * Shopping Cart & Checkout Preparation Routes
 * @route /api/v1/cart
 */
v1Router.use('/cart', cartRoutes);

/**
 * Delivery Eligibility & Express Rules Routes
 * @route /api/v1/delivery
 */
v1Router.use('/delivery', deliveryRoutes);

/**
 * Orders & Payment Lifecycle Routes
 * @route /api/v1/orders
 */
v1Router.use('/orders', orderRoutes);

/**
 * Administrator Operations & Telemetry Routes
 * @route /api/v1/admin
 */
v1Router.use('/admin', adminRoutes);



/**
 * Version 1 Health Probe
 * @route GET /api/v1/health
 */
v1Router.use('/health', healthRoutes);

/**
 * Validation Test Route
 * Allows verifying request validation using Zod without business module dependencies.
 * @route POST /api/v1/validate-test
 */
const sampleValidationSchema = {
  body: z.object({
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a valid number' })
      .min(10, { message: 'Minimum order quantity for GIFT KRO is 10 pieces' }),
    category: z.enum(['customized', 'event', 'group', 'corporate'], {
      errorMap: () => ({
        message: 'Category must be one of: customized, event, group, corporate',
      }),
    }),
    contactEmail: z.string().email({ message: 'Must provide a valid contact email address' }),
  }),
};

v1Router.post(
  '/validate-test',
  validateRequest(sampleValidationSchema),
  (req, res) => {
    return ApiResponse.success(res, {
      message: 'Zod validation passed successfully.',
      data: req.body,
    });
  }
);

// Future Business modules reserved for subsequent steps:
// v1Router.use('/cart', cartRoutes);
// v1Router.use('/orders', orderRoutes);
// v1Router.use('/payments', paymentRoutes);

export default v1Router;
