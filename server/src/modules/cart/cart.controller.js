import crypto from 'crypto';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { CartService } from './cart.service.js';

const getGuestToken = (req, res) => {
  let token = req.cookies?.guestCartToken || req.headers['x-cart-token'];
  if (!token) {
    token = crypto.randomUUID();
    res.cookie('guestCartToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }
  return token;
};

export class CartController {
  /**
   * Get current cart with real-time price & stock revalidation.
   * GET /api/v1/cart
   */
  static getCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const cart = await CartService.getOrCreateCart({ userId, guestToken });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Cart retrieved and revalidated successfully',
      data: cart,
    });
  });

  /**
   * Add customized item to cart.
   * POST /api/v1/cart/items
   */
  static addItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const updatedCart = await CartService.addItem({
      userId,
      guestToken,
      itemData: req.body,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Customized T-shirt configuration added to cart',
      data: updatedCart,
    });
  });

  /**
   * Update item in cart.
   * PUT /api/v1/cart/items/:itemId
   */
  static updateItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const updatedCart = await CartService.updateItem({
      userId,
      guestToken,
      itemId: req.params.itemId,
      updateData: req.body,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Cart item updated and recalculated successfully',
      data: updatedCart,
    });
  });

  /**
   * Remove item from cart.
   * DELETE /api/v1/cart/items/:itemId
   */
  static removeItem = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const updatedCart = await CartService.removeItem({
      userId,
      guestToken,
      itemId: req.params.itemId,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Item removed from cart',
      data: updatedCart,
    });
  });

  /**
   * Clear entire cart.
   * DELETE /api/v1/cart
   */
  static clearCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const cart = await CartService.clearCart({ userId, guestToken });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Cart cleared successfully',
      data: cart,
    });
  });

  /**
   * Merge guest cart into user cart upon login.
   * POST /api/v1/cart/merge
   */
  static mergeCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Must be authenticated to merge cart',
      });
    }

    const guestToken = req.body.guestToken || req.cookies?.guestCartToken || req.headers['x-cart-token'];
    const mergedCart = await CartService.mergeGuestCart({ userId, guestToken });

    // Clear guest cookie after merge
    res.clearCookie('guestCartToken');

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Guest cart merged successfully',
      data: mergedCart,
    });
  });

  /**
   * Prepare checkout: validate items, address, delivery estimate.
   * POST /api/v1/cart/checkout-prep
   */
  static prepareCheckout = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestToken = userId ? null : getGuestToken(req, res);

    const checkoutPrep = await CartService.prepareCheckout({
      userId,
      guestToken,
      checkoutData: req.body,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Checkout preparation and revalidation complete',
      data: checkoutPrep,
    });
  });
}
