import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Express middleware for structured HTTP request and response logging.
 * Measures roundtrip execution duration in milliseconds and outputs format
 * optimized for development readability or production machine parsing.
 */
export const requestLogger = (req, res, next) => {
  const startNano = process.hrtime.bigint();

  // Capture completion event when headers and payload have finished sending
  res.on('finish', () => {
    const endNano = process.hrtime.bigint();
    const durationMs = Number(endNano - startNano) / 1_000_000;
    const formattedDuration = durationMs.toFixed(2);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    if (env.NODE_ENV === 'production') {
      // Structured JSON log for log aggregators (Datadog, CloudWatch, Loki)
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'http',
        method,
        url,
        statusCode,
        durationMs: Number(formattedDuration),
        ip: clientIp,
        userAgent: req.headers['user-agent'] || 'unknown',
      };
      console.log(JSON.stringify(logEntry));
    } else {
      // Human-readable dev output
      const statusColorCode =
        statusCode >= 500
          ? 'error'
          : statusCode >= 400
            ? 'warn'
            : 'info';

      logger[statusColorCode](
        `[HTTP] ${method} ${url} ${statusCode} - ${formattedDuration}ms - ${clientIp}`
      );
    }
  });

  next();
};
