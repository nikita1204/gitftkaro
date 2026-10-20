import { Router } from 'express';
import { checkHealth } from './health.controller.js';
import { healthRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   GET /health (or /v1/health)
 * @desc    Comprehensive system health and readiness probe reporting application and database metrics separately
 * @access  Public
 */
router.get('/', healthRateLimiter, checkHealth);

export default router;
