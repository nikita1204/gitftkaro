import { apiClient } from './apiClient.js';

export const adminService = {
  /**
   * Fetch real aggregated business metrics calculated directly from MongoDB.
   */
  async getMetrics() {
    const res = await apiClient.get('/v1/admin/metrics');
    return res.data;
  },

  /**
   * Fetch paginated administrative audit logs.
   * @param {Object} params - { page, limit, targetEntity, action }
   */
  async getAuditLogs(params = {}) {
    const res = await apiClient.get('/v1/admin/audit-logs', { params });
    return res.data;
  },
};
