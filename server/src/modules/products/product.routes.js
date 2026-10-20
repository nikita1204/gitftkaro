import { Router } from 'express';
import {
  listProducts,
  getProductDetails,
  getFeaturedProducts,
  createNewProduct,
  editProduct,
  toggleStatus,
  deleteProduct,
} from './product.controller.js';
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
} from './product.validator.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// 1. Featured products endpoint (must be declared before :slugOrId to avoid matching 'featured' as slug)
router.get('/featured', getFeaturedProducts);

// 2. Public paginated listing with search, category, price, and color filters
router.get('/', validateRequest(productQuerySchema), listProducts);

// 3. Public product details by slug or ID
router.get('/:slugOrId', getProductDetails);

// 4. Admin-only product creation
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createProductSchema),
  createNewProduct
);

// 5. Admin-only product modification
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateProductSchema),
  editProduct
);

// 6. Admin-only product activation / deactivation toggle
router.patch('/:id/status', authenticate, authorize('admin'), toggleStatus);

// 7. Admin-only product archival
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
