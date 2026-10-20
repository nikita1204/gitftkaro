import { Router } from 'express';
import { DeliveryController } from './delivery.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  checkEligibilitySchema,
  updateConfigSchema,
  createZoneSchema,
} from './delivery.validator.js';

const router = Router();

/**
 * Public Routes
 */

// 1. Check delivery eligibility and estimated window for a PIN code and quantity
router.post(
  '/check-eligibility',
  validateRequest(checkEligibilitySchema),
  DeliveryController.checkEligibility
);

// 2. Get list of active serviceable PIN codes and localities for Raipur
router.get('/pincodes', DeliveryController.getPincodes);

// 3. Get current public delivery configuration rules
router.get('/config', DeliveryController.getConfig);

/**
 * Admin Routes (requires authenticate & authorize('admin'))
 */

// 4. Update global delivery configuration rules
router.put(
  '/config',
  authenticate,
  authorize('admin'),
  validateRequest(updateConfigSchema),
  DeliveryController.updateConfig
);

// 5. List all zones (including active/inactive) for management
router.get('/zones', authenticate, authorize('admin'), DeliveryController.getAllZones);

// 6. Create a new serviceable zone / PIN code
router.post(
  '/zones',
  authenticate,
  authorize('admin'),
  validateRequest(createZoneSchema),
  DeliveryController.createZone
);

// 7. Update an existing zone
router.put(
  '/zones/:id',
  authenticate,
  authorize('admin'),
  DeliveryController.updateZone
);

// 8. Toggle active status of a zone
router.patch(
  '/zones/:id/status',
  authenticate,
  authorize('admin'),
  DeliveryController.toggleZone
);

// 9. Delete a zone
router.delete(
  '/zones/:id',
  authenticate,
  authorize('admin'),
  DeliveryController.deleteZone
);

export default router;
