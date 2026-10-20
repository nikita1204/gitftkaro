import { apiClient } from './apiClient.js';

export const orderService = {
  /**
   * Create an official order from server-validated cart items and get Razorpay order session.
   * @param {Object} orderData - { contact, shippingAddress, idempotencyKey }
   */
  async createOrder(orderData) {
    const res = await apiClient.post('/v1/orders', orderData);
    return res.data;
  },

  /**
   * Verify Razorpay payment signature after successful checkout modal callback.
   * @param {Object} paymentData - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
   */
  async verifyPayment(paymentData) {
    const res = await apiClient.post('/v1/orders/verify-payment', paymentData);
    return res.data;
  },

  /**
   * Report payment failure or dismissal.
   * @param {Object} data - { razorpayOrderId, failureReason }
   */
  async reportPaymentFailure(data) {
    const res = await apiClient.post('/v1/orders/payment-failed', data);
    return res.data;
  },

  /**
   * Development sandbox simulation: generates valid HMAC-SHA256 signature and verifies payment.
   * @param {string} orderId
   */
  async simulateTestPayment(orderId) {
    const res = await apiClient.post('/v1/orders/simulate-test-payment', { orderId });
    return res.data;
  },

  /**
   * Get single order by order ID or orderNumber for tracking.
   * @param {string} idOrNumber
   */
  async getOrderDetails(idOrNumber) {
    const res = await apiClient.get(`/v1/orders/${idOrNumber}`);
    return res.data;
  },

  /**
   * Get authenticated customer's order history.
   */
  async getMyOrders() {
    const res = await apiClient.get('/v1/orders/my-orders');
    return res.data;
  },

  /**
   * Administrator: Query orders with search, filters, and pagination.
   * @param {Object} params - { page, limit, status, search, isExpress, sort }
   */
  async adminGetOrders(params = {}) {
    const res = await apiClient.get('/v1/orders/admin/all', { params });
    return res.data;
  },

  /**
   * Administrator: Update order status with transition rules enforcement.
   * @param {string} id
   * @param {Object} updateData - { orderStatus, comment }
   */
  async adminUpdateStatus(id, updateData) {
    const res = await apiClient.patch(`/v1/orders/${id}/status`, updateData);
    return res.data;
  },

  /**
   * Administrator: Review artwork file (approve or request revision).
   * @param {string} orderId
   * @param {string} itemId
   * @param {string} artworkId
   * @param {Object} reviewData - { approvalStatus, reviewNotes }
   */
  async adminUpdateArtwork(orderId, itemId, artworkId, reviewData) {
    const res = await apiClient.patch(
      `/v1/orders/${orderId}/items/${itemId}/artworks/${artworkId}`,
      reviewData
    );
    return res.data;
  },
};
