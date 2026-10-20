import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Standardized API Response formatter for all GIFT KRO backend endpoints.
 * Ensures strict, consistent response envelopes across all success and error outcomes.
 */
export class ApiResponse {
  /**
   * Sends a standardized success JSON response.
   *
   * @param {import('express').Response} res - Express response object
   * @param {Object} options
   * @param {number} [options.statusCode=200] - HTTP status code
   * @param {string} [options.message='Success'] - Human-readable success message
   * @param {*} [options.data=null] - Primary response payload
   * @param {Object} [options.meta=null] - Optional metadata (pagination, counts, filters)
   * @returns {import('express').Response}
   */
  static success(
    res,
    { statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null }
  ) {
    const payload = {
      success: true,
      statusCode,
      message,
      data,
    };

    if (meta !== null && meta !== undefined) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Sends a standardized error JSON response.
   * Guarantees zero leakage of stack traces or internal secrets.
   *
   * @param {import('express').Response} res - Express response object
   * @param {Object} options
   * @param {number} [options.statusCode=500] - HTTP status code
   * @param {string} [options.message='Error'] - Human-readable error message
   * @param {Array|Object|null} [options.errors=null] - Granular validation or field errors
   * @returns {import('express').Response}
   */
  static error(
    res,
    { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'Error', errors = null }
  ) {
    const payload = {
      success: false,
      statusCode,
      message,
    };

    if (errors !== null && errors !== undefined) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}
