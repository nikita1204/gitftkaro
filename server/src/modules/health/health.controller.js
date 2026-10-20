import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { RESPONSE_MESSAGES } from '../../constants/responseMessages.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getHealthMetrics } from './health.service.js';

/**
 * Health check controller.
 * Gathers system and database metrics and returns a standardized success response.
 */
export const checkHealth = asyncHandler(async (req, res) => {
  const healthData = await getHealthMetrics();

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: RESPONSE_MESSAGES.HEALTH_OK,
    data: healthData,
  });
});
