import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getAdminMetrics,
} from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validator.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new customer account
 * @access  Public
 */
router.post('/register', authRateLimiter, validateRequest(registerSchema), register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate customer or admin and issue session token/cookie
 * @access  Public
 */
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear HTTP-only session cookie
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user session
 * @access  Private (Authenticated users)
 */
router.get('/me', authenticate, getMe);

/**
 * @route   GET /api/v1/auth/admin-metrics
 * @desc    Role-restricted administrator diagnostic probe
 * @access  Private (Admins only)
 */
router.get('/admin-metrics', authenticate, authorize('admin'), getAdminMetrics);

export default router;
