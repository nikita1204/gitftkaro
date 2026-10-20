import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const readyStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// Lifecycle Event Listeners for Comprehensive MongoDB Monitoring
mongoose.connection.on('connecting', () => {
  logger.info('MongoDB: Establishing connection...');
});

mongoose.connection.on('connected', () => {
  logger.info(`MongoDB: Connection successfully established to host: ${mongoose.connection.host}`);
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB: Connection re-established.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB: Connection error encountered: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB: Connection lost / disconnected.');
});

mongoose.connection.on('close', () => {
  logger.info('MongoDB: Connection closed gracefully.');
});

/**
 * Actively pings the connected MongoDB cluster to measure roundtrip latency.
 * @returns {Promise<number|null>} Ping latency in milliseconds, or null if unreachable
 */
export const pingDatabase = async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return null;
  }
  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    return Date.now() - start;
  } catch {
    return null;
  }
};

/**
 * Returns current snapshot of database connection telemetry.
 */
export const getDbStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: readyStates[stateCode] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    isConnected: stateCode === 1,
  };
};

/**
 * Initializes MongoDB connection with a 5-second resilient timeout.
 */
export const connectDB = async () => {
  try {
    if (!env.MONGODB_URI) {
      logger.warn('No MONGODB_URI configured. Running server in standalone disconnected mode.');
      return;
    }

    logger.info('Attempting MongoDB connection...');
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    logger.warn(
      `MongoDB connection failed (${error.message}). Server continues running in standalone/unconnected mode.`
    );
  }
};

/**
 * Gracefully disconnects MongoDB connection during server shutdown.
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected gracefully.');
    }
  } catch (error) {
    logger.error(`Error during MongoDB disconnection: ${error.message}`);
  }
};
