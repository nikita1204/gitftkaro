import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * 404 Not Found Middleware.
 * Catches any HTTP requests that do not match registered API endpoints or routes,
 * returning a standardized error response envelope.
 */
export const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Cannot ${req.method} ${req.originalUrl}. The requested endpoint does not exist.`,
  });
};
