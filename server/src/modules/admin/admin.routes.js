import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// Protect ALL routes in this router with authenticate + authorize('admin')
router.use(authenticate, authorize('admin'));

// Real summary metrics for the administrative dashboard
router.get('/metrics', AdminController.getMetrics);

// Paginated administrative audit logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
