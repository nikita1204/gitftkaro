import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Common custom error handler for rate limit violations.
 * Standardizes the 429 response using ApiResponse.error.
 */
const rateLimitHandler = (message = RESPONSE_MESSAGES.RATE_LIMIT_EXCEEDED) => (req, res) => {
  return ApiResponse.error(res, {
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message,
  });
};

/**
 * 1. Global API Rate Limiter
 * Applied to all general /api routes to prevent abuse while allowing normal shopping flows.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 5000 : (env.RATE_LIMIT_MAX || 300), // Requests per window per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: rateLimitHandler(RESPONSE_MESSAGES.RATE_LIMIT_EXCEEDED),
});


/**
 * 2. Sensitive / Authentication Rate Limiter
 * Strict limiter applied to authentication endpoints (login, register, forgot-password, OTP)
 * to defend against brute force, credential stuffing, and account enumeration.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts. Please try again after 15 minutes.'),
});

/**
 * 3. Health & Telemetry Rate Limiter
 * High-frequency limiter designed for status probes and uptime monitors without consuming
 * general business quotas.
 */
export const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Health probe rate limit reached. Please throttle probe interval.'),
});

// Backward compatibility alias
export const apiRateLimiter = globalRateLimiter;
