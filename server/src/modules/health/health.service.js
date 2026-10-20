import { getDbStatus, pingDatabase } from '../../config/db.js';
import { env } from '../../config/env.js';

/**
 * Formats uptime in seconds to human-readable format (e.g. 1d 2h 30m 15s)
 */
const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

/**
 * Compiles comprehensive health telemetry, separating application and database diagnostics.
 * @returns {Promise<Object>} Structured health report
 */
export const getHealthMetrics = async () => {
  const dbStatus = getDbStatus();
  const pingMs = dbStatus.isConnected ? await pingDatabase() : null;
  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();

  const isDbHealthy = dbStatus.isConnected;
  const overallStatus = isDbHealthy ? 'healthy' : 'degraded';

  return {
    // Backwards-compatible top-level properties consumed by frontend
    status: overallStatus,
    service: 'GIFT KRO API Server',
    environment: env.NODE_ENV,
    uptimeSeconds,
    timestamp: new Date().toISOString(),

    // 1. Application-Specific Health & Runtime Metrics
    application: {
      status: 'healthy',
      name: 'gift-kro-server',
      version: '1.0.0',
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      pid: process.pid,
      uptimeSeconds,
      uptimeFormatted: formatUptime(uptimeSeconds),
      memory: {
        rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      },
    },

    // 2. Database-Specific Health & Connectivity Telemetry
    database: {
      status: dbStatus.status,
      readyState: dbStatus.stateCode,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.name,
      pingMs,
    },

    // 3. Raipur 24-Hour Custom Gifting USP Metadata
    usp: {
      headline: '24-Hour Custom T-shirt Printing',
      region: 'Raipur, Chhattisgarh',
      minimumOrderQuantity: 10,
    },
  };
};
