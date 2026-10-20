import { apiClient } from './apiClient.js';

export const cartService = {
  /**
   * Fetch current cart with live server-side price & stock revalidation.
   */
  async getCart() {
    const res = await apiClient.get('/v1/cart');
    return res.data;
  },

  /**
   * Add customized item to cart.
   * @param {Object} itemData
   */
  async addItem(itemData) {
    const res = await apiClient.post('/v1/cart/items', itemData);
    return res.data;
  },

  /**
   * Update quantity, sizes or options of existing cart item.
   * @param {string} itemId
   * @param {Object} updateData
   */
  async updateItem(itemId, updateData) {
    const res = await apiClient.put(`/v1/cart/items/${itemId}`, updateData);
    return res.data;
  },

  /**
   * Remove item from cart.
   * @param {string} itemId
   */
  async removeItem(itemId) {
    const res = await apiClient.delete(`/v1/cart/items/${itemId}`);
    return res.data;
  },

  /**
   * Clear all items in cart.
   */
  async clearCart() {
    const res = await apiClient.delete('/v1/cart');
    return res.data;
  },

  /**
   * Merge guest cart into user cart upon login.
   * @param {string} guestToken
   */
  async mergeGuestCart(guestToken) {
    const res = await apiClient.post('/v1/cart/merge', { guestToken });
    return res.data;
  },

  /**
   * Prepare checkout: revalidate cart, validate shipping address and contact details.
   * @param {Object} checkoutData - { contact, shippingAddress }
   */
  async prepareCheckout(checkoutData) {
    const res = await apiClient.post('/v1/cart/checkout-prep', checkoutData);
    return res.data;
  },
};
