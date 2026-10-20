import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AdminService } from './admin.service.js';
import { AuditLogService } from '../audit/auditLog.service.js';

export class AdminController {
  /**
   * Compute real business metrics directly from MongoDB.
   * GET /api/v1/admin/metrics
   */
  static getMetrics = asyncHandler(async (req, res) => {
    const metrics = await AdminService.getSummaryMetrics();
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Real administrator telemetry retrieved successfully',
      data: metrics,
    });
  });

  /**
   * Retrieve paginated administrative audit logs.
   * GET /api/v1/admin/audit-logs
   */
  static getAuditLogs = asyncHandler(async (req, res) => {
    const { page, limit, targetEntity, action } = req.query;
    const result = await AuditLogService.getLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      targetEntity,
      action,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Audit logs retrieved successfully',
      data: result,
    });
  });
}
