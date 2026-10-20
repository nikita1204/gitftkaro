import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getCookieOptions,
} from './auth.service.js';
import { User } from './user.model.js';

/**
 * Handles customer registration.
 * Creates user, generates JWT, sets HTTP-only cookie, and returns safe user data.
 */
export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerUser(req.body);

  // Set secure HTTP-only cookie
  res.cookie('token', token, getCookieOptions());

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Account registered successfully. Welcome to GIFT KRO!',
    data: { user, token },
  });
});

/**
 * Handles customer & admin login.
 * Validates credentials, issues JWT session, sets HTTP-only cookie.
 */
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  // Set secure HTTP-only cookie
  res.cookie('token', token, getCookieOptions());

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Signed in successfully.',
    data: { user, token },
  });
});

/**
 * Handles user logout.
 * Clears the HTTP-only session cookie.
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookie with identical path and security flags
  res.clearCookie('token', getCookieOptions());

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Signed out successfully.',
  });
});

/**
 * Returns currently authenticated user session.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Current user session retrieved.',
    data: { user },
  });
});

/**
 * Protected Administrator Probe Endpoint.
 * Used for verifying role-based authorization (admin only).
 */
export const getAdminMetrics = asyncHandler(async (req, res) => {
  const customerCount = await User.countDocuments({ role: 'customer' });
  const adminCount = await User.countDocuments({ role: 'admin' });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Administrator authorization verified.',
    data: {
      adminUser: req.user.email,
      role: req.user.role,
      userMetrics: {
        totalCustomers: customerCount,
        totalAdmins: adminCount,
      },
      raipurOperations: {
        hub: 'Raipur Express Printing Facility',
        minOrderQuantity: 10,
        avgTurnaroundHours: 24,
      },
    },
  });
});
