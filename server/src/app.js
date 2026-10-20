import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

const app = express();


// Trust reverse proxy for accurate client IP detection in rate limiting and logs
app.set('trust proxy', 1);

// Remove default Express fingerprinting header
app.disable('x-powered-by');

// 1. Structured HTTP Request Logging
app.use(requestLogger);

// 2. Helmet HTTP Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. Strict CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
      ];
      // Allow requests with no origin (e.g., curl, mobile probes, server-to-server) in development
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400,
  })
);

// 4. Body Parsers with 10MB payload size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Cookie Parser for secure auth tokens
app.use(cookieParser());

// 6. Serve static uploads (artworks, proofs, documents)
app.use('/uploads', express.static(uploadsDir));

// 7. Global Rate Limiter applied to all /api routes
app.use('/api', globalRateLimiter);

// 8. Mount Master API Router (/api/health and /api/v1/...)
app.use('/api', apiRouter);


// 8. 404 Handler for undefined routes
app.use(notFoundHandler);

// 9. Centralized Error Handling Middleware (strictly suppresses stack traces and secrets in production)
app.use(errorHandler);

export default app;
