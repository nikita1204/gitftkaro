import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { env } from '../../config/env.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { AppError } from '../../utils/appError.js';

/**
 * Signs a JWT payload for authenticated sessions
 * @param {Object} user - User document
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Standard cookie configuration for HTTP-only session token storage.
 * Enforces httpOnly, sameSite, and path security.
 * @returns {Object} Cookie options
 */
export const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

/**
 * Registers a new customer account.
 * Rejects duplicate emails and forces role to 'customer'.
 */
export const registerUser = async ({ name, email, password, phone, city }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate account
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(
      'An account with this email address already exists. Please sign in or use another email.',
      HTTP_STATUS.CONFLICT
    );
  }

  // Create customer user
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: 'customer', // Public registration is strictly customer
    phone: phone || '',
    address: {
      city: city || 'Raipur',
      state: 'Chhattisgarh',
    },
  });

  const token = generateToken(newUser);
  return {
    user: newUser.toJSON(),
    token,
  };
};

/**
 * Authenticates user credentials and issues a new session token.
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly include password for comparison
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  const token = generateToken(user);
  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Fetches current authenticated user profile by ID
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError(
      'User account not found or deactivated.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  return user.toJSON();
};
