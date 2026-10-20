import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Custom Operational Application Error class.
 * Differentiates anticipated operational errors (invalid input, 404s, unauthorized access)
 * from unexpected programming bugs or infrastructure crashes.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Descriptive error message
   * @param {number} [statusCode=500] - Associated HTTP status code
   * @param {Array|Object|null} [errors=null] - Optional detailed field-level error details
   */
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
