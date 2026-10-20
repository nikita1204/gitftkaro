import { AuditLog } from './auditLog.model.js';
import { logger } from '../../utils/logger.js';

export class AuditLogService {
  /**
   * Log an administrative action to the database.
   *
   * @param {Object} params
   * @param {string} params.action - e.g. 'ORDER_STATUS_UPDATE'
   * @param {Object} params.admin - User document or req.user
   * @param {string} params.targetEntity - 'Order' | 'Product' | 'DeliveryZone' | etc.
   * @param {string} params.targetId
   * @param {Object} params.details - { previousState, newState, reason, etc. }
   * @param {Object} [params.req] - Express request for IP and UserAgent
   */
  static async logAction({
    action,
    admin,
    targetEntity,
    targetId,
    details = {},
    req = null,
  }) {
    try {
      const ipAddress = req
        ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || ''
        : '';
      const userAgent = req ? req.headers['user-agent'] || '' : '';

      const log = new AuditLog({
        action,
        admin: admin?._id || admin?.id,
        adminEmail: admin?.email || 'admin@giftkro.com',
        adminName: admin?.name || 'Administrator',
        targetEntity,
        targetId: String(targetId),
        details,
        ipAddress,
        userAgent,
      });

      await log.save();
      logger.info(`[AUDIT] ${action} on ${targetEntity} #${targetId} by ${admin?.email}`);
      return log;
    } catch (err) {
      logger.error('Failed to write audit log:', { error: err.message });
      // Non-blocking: fail gracefully so core operation succeeds
      return null;
    }
  }

  /**
   * Query paginated audit logs for admin inspection.
   */
  static async getLogs({ page = 1, limit = 20, targetEntity = null, action = null }) {
    const query = {};
    if (targetEntity) query.targetEntity = targetEntity;
    if (action) query.action = action;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('admin', 'name email role')
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
