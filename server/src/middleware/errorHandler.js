import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

// Re-export AppError for backward-compatibility
export { AppError };

/**
 * Centralized Error-Handling Middleware for Express.
 * Formats all operational and programming errors into the uniform GIFT KRO API envelope.
 * Strictly prevents stack traces, internal system paths, and database credentials from leaking in production.
 *
 * @param {Error} err - Captured error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} _next - Express next function (required 4-arg signature)
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || RESPONSE_MESSAGES.SERVER_ERROR;
  let errors = err.errors || null;

  // 1. Handle CORS origin rejection
  if (err.message && err.message.startsWith('CORS blocked for origin:')) {
    statusCode = HTTP_STATUS.FORBIDDEN;
    message = 'Cross-Origin Request Blocked: Access not permitted from this origin.';
  }

  // 2. Handle Body Parser Malformed JSON SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON payload in request body.';
  }

  // 3. Handle Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid value for parameter: ${err.path}`;
  }

  // 4. Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. That value is already in use.`;
  }

  // 5. Handle Mongoose Schema Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = RESPONSE_MESSAGES.VALIDATION_ERROR;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // 6. Handle JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token has expired.';
  }

  // 7. Production Security Guardrail: Never leak internal 500 error messages or stacks
  const isProduction = env.NODE_ENV === 'production';
  if (isProduction && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR && !err.isOperational) {
    message = RESPONSE_MESSAGES.SERVER_ERROR;
    errors = null;
  }

  // 8. Server-side Error Logging
  const logMeta = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
  };

  if (!isProduction && err.stack) {
    logMeta.stack = err.stack;
  }

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${err.message}`, logMeta);

  // 9. Standardized API Response (stack trace is NEVER included in client responses)
  return ApiResponse.error(res, {
    statusCode,
    message,
    errors,
  });
};
