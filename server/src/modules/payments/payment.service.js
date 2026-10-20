import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    } catch (err) {
      logger.warn('Razorpay SDK initialization notice:', { error: err.message });
    }
  }
  return razorpayInstance;
};

export class PaymentService {
  /**
   * Create an official order on Razorpay for checkout.
   * Converts amount in INR to paise (e.g., ₹500 -> 50000 paise).
   *
   * @param {Object} params
   * @param {number} params.amount - Total in INR
   * @param {string} params.receipt - GIFT KRO Order Number (e.g. GK-ORD-...)
   * @param {Object} [params.notes]
   * @returns {Promise<Object>} Razorpay Order Object
   */
  static async createOrder({ amount, receipt, notes = {} }) {
    const amountInPaise = Math.round(Number(amount) * 100);
    const rzp = getRazorpayInstance();

    // Check if test keys are real Razorpay keys or dev mock keys
    const isMockDevKey =
      !env.RAZORPAY_KEY_ID ||
      env.RAZORPAY_KEY_ID.includes('dev_key') ||
      env.RAZORPAY_KEY_ID.includes('mock');

    if (!isMockDevKey && rzp) {
      try {
        const order = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: String(receipt).slice(0, 40),
          notes: {
            ...notes,
            platform: 'GIFT KRO Raipur',
          },
        });
        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          isMock: false,
        };
      } catch (err) {
        logger.error('Razorpay API order creation failed, falling back to secure test sandbox order:', {
          error: err.message,
        });
      }
    }

    // Secure Sandbox/Mock order for development & automated tests
    const mockOrderId = `order_${crypto.randomBytes(10).toString('hex')}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(receipt).slice(0, 40),
      status: 'created',
      isMock: true,
    };
  }

  /**
   * Verify HMAC-SHA256 signature returned by Razorpay Checkout upon successful customer payment.
   * Formula: hmac_sha256(order_id + "|" + payment_id, secret) === signature
   *
   * @param {Object} params
   * @param {string} params.razorpayOrderId
   * @param {string} params.razorpayPaymentId
   * @param {string} params.razorpaySignature
   * @returns {boolean} True if signature is cryptographically valid
   */
  static verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // Use timingSafeEqual to avoid timing attack vulnerabilities
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(razorpaySignature, 'utf8');
      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Verify authenticity of Razorpay Webhook notification payload.
   *
   * @param {string|Buffer} rawBody - Raw unparsed webhook request body
   * @param {string} signature - X-Razorpay-Signature header
   * @returns {boolean}
   */
  static verifyWebhookSignature(rawBody, signature) {
    if (!rawBody || !signature || !env.RAZORPAY_WEBHOOK_SECRET) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const actualBuffer = Buffer.from(signature, 'utf8');
      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Generate a test signature for testing / sandbox verification.
   */
  static generateTestSignature(orderId, paymentId) {
    const payload = `${orderId}|${paymentId}`;
    return crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(payload).digest('hex');
  }
}
