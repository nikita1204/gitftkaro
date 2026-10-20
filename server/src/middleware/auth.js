import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../modules/auth/user.model.js';

/**
 * Authentication Middleware.
 * Extracts JWT from either HTTP-only cookie or Bearer Authorization header,
 * verifies signature, validates active user existence in MongoDB, and attaches user to req.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie first (preferred strategy for browser security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization: Bearer <token> header (for API clients, mobile, or Postman)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(
      'Authentication required. Please sign in to access this resource.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // 3. Verify JWT token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please sign in again.', HTTP_STATUS.UNAUTHORIZED);
    }
    throw new AppError('Invalid authentication session. Please sign in again.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 4. Verify user still exists in database and is active
  const currentUser = await User.findById(decoded.id);
  if (!currentUser || !currentUser.isActive) {
    throw new AppError(
      'The user account associated with this session no longer exists or has been deactivated.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // 5. Attach safe user object to request
  req.user = currentUser.toJSON();
  req.user._id = currentUser._id;
  req.user.id = currentUser._id.toString();
  req.token = token;

  next();
});

/**
 * Role-Based Authorization Middleware.
 * Restricts endpoint access to specific user roles (e.g. 'admin', 'customer').
 *
 * @param {...string} roles - Allowed roles
 * @returns {import('express').RequestHandler}
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Access forbidden: You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};

/**
 * Optional Authentication Middleware.
 * If token is present and valid, attaches user to req.user.
 * If not present or expired, safely proceeds as guest.
 */
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser.toJSON();
      req.user._id = currentUser._id;
      req.user.id = currentUser._id.toString();
      req.token = token;
    }
  } catch {
    // Silently continue as guest if token is invalid/expired
  }

  next();
});

