import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { optionalAuthenticate, authenticate } from '../../middleware/auth.js';
import {
  addItemToCartSchema,
  updateCartItemSchema,
  checkoutPreparationSchema,
} from './cart.validator.js';

const router = Router();

/**
 * @route   GET /api/v1/cart
 * @desc    Get current cart with live revalidation of prices and stock
 * @access  Public (Guest or Authenticated)
 */
router.get('/', optionalAuthenticate, CartController.getCart);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Add customized T-shirt configuration to cart (MOQ 10 pcs)
 * @access  Public (Guest or Authenticated)
 */
router.post(
  '/items',
  optionalAuthenticate,
  validateRequest(addItemToCartSchema),
  CartController.addItem
);

/**
 * @route   PUT /api/v1/cart/items/:itemId
 * @desc    Update quantity, size distribution, or options of cart item
 * @access  Public (Guest or Authenticated)
 */
router.put(
  '/items/:itemId',
  optionalAuthenticate,
  validateRequest(updateCartItemSchema),
  CartController.updateItem
);

/**
 * @route   DELETE /api/v1/cart/items/:itemId
 * @desc    Remove an item from cart
 * @access  Public (Guest or Authenticated)
 */
router.delete('/items/:itemId', optionalAuthenticate, CartController.removeItem);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear all items in cart
 * @access  Public (Guest or Authenticated)
 */
router.delete('/', optionalAuthenticate, CartController.clearCart);

/**
 * @route   POST /api/v1/cart/merge
 * @desc    Merge guest cart into user account cart upon login
 * @access  Private (Authenticated)
 */
router.post('/merge', authenticate, CartController.mergeCart);

/**
 * @route   POST /api/v1/cart/checkout-prep
 * @desc    Prepare and revalidate checkout with shipping address and delivery estimates
 * @access  Public (Guest or Authenticated)
 */
router.post(
  '/checkout-prep',
  optionalAuthenticate,
  validateRequest(checkoutPreparationSchema),
  CartController.prepareCheckout
);

export default router;
