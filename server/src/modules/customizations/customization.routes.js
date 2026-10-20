import { Router } from 'express';
import { CustomizationController } from './customization.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth.js';
import { uploadArtworkMiddleware } from './upload.middleware.js';
import {
  calculateQuoteSchema,
  createCustomizationSchema,
  queryCustomizationsSchema,
} from './customization.validator.js';

const router = Router();

/**
 * @route   GET /api/v1/customizations/pricing-rules
 * @desc    Fetch active customization & pricing configuration rules
 * @access  Public
 */
router.get('/pricing-rules', CustomizationController.getPricingRules);

/**
 * @route   POST /api/v1/customizations/calculate-quote
 * @desc    Calculate real-time verified price quote with volume tiers and size surcharges
 * @access  Public
 */
router.post(
  '/calculate-quote',
  validateRequest(calculateQuoteSchema),
  CustomizationController.calculateQuote
);

/**
 * @route   POST /api/v1/customizations/upload-artwork
 * @desc    Upload customer artwork or design reference with 10MB limit and MIME checks
 * @access  Public
 */
router.post(
  '/upload-artwork',
  uploadArtworkMiddleware('artwork', 5),
  CustomizationController.uploadArtwork
);

/**
 * @route   POST /api/v1/customizations
 * @desc    Persist a full customization specification with server-calculated price lock
 * @access  Public (Guest or Authenticated)
 */
router.post(
  '/',
  optionalAuthenticate,
  validateRequest(createCustomizationSchema),
  CustomizationController.createCustomization
);

/**
 * @route   GET /api/v1/customizations/:codeOrId
 * @desc    Retrieve saved customization details by unique code or ID
 * @access  Public
 */
router.get('/:codeOrId', optionalAuthenticate, CustomizationController.getCustomization);

/**
 * @route   GET /api/v1/customizations
 * @desc    List all customization inquiries with pagination and filters
 * @access  Admin only
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(queryCustomizationsSchema),
  CustomizationController.listCustomizations
);

/**
 * @route   PATCH /api/v1/customizations/:id/status
 * @desc    Update customization inquiry status (e.g. in_review, converted_to_order)
 * @access  Admin only
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  CustomizationController.updateStatus
);

export default router;
