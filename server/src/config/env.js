import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Strict Environment Schema using Zod.
 * Validates all required runtime variables upon server initialization.
 */
const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid port number between 1 and 65535.',
    }),

  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      errorMap: () => ({ message: 'NODE_ENV must be one of: development, production, test.' }),
    })
    .default('development'),

  MONGODB_URI: z
    .string()
    .min(1, { message: 'MONGODB_URI must not be empty.' })
    .refine(
      (uri) => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'),
      { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' }
    )
    .default('mongodb://127.0.0.1:27017/gift_kro_dev'),

  CLIENT_URL: z
    .string()
    .url({ message: 'CLIENT_URL must be a valid HTTP/HTTPS URL.' })
    .default('http://localhost:3000'),

  JWT_SECRET: z
    .string()
    .min(16, { message: 'JWT_SECRET must be at least 16 characters long for cryptographic security.' })
    .default('dev_jwt_secret_gift_kro_secure_token_key_raipur_2026'),

  JWT_EXPIRES_IN: z
    .string()
    .default('7d'),

  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000')
    .transform((val) => parseInt(val, 10)),

  RATE_LIMIT_MAX: z
    .string()
    .default('300')
    .transform((val) => parseInt(val, 10)),

  // Razorpay Payment Gateway Configuration
  RAZORPAY_KEY_ID: z
    .string()
    .default('rzp_test_giftkro_dev_key'),

  RAZORPAY_KEY_SECRET: z
    .string()
    .default('rzp_test_secret_giftkro_2026'),

  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .default('rzp_webhook_secret_giftkro_2026'),
});

// Run synchronous validation at module load
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );

  logger.error('CRITICAL: Environment configuration validation failed at startup:', {
    issues: formattedErrors,
  });

  if (process.env.NODE_ENV === 'production') {
    logger.error('Terminating process in production due to invalid configuration.');
    process.exit(1);
  } else {
    logger.warn('Running with fallback defaults in development mode.');
  }
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
