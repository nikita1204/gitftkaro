import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createNewCategory,
} from './product.controller.js';
import { createCategorySchema } from './product.validator.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// Public: List all active categories with product counts
router.get('/', listCategories);

// Public: Get single category details
router.get('/:slug', getCategory);

// Admin-only: Create new category
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createCategorySchema),
  createNewCategory
);

export default router;
