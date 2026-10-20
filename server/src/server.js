import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let server;

const startServer = async () => {
  // Start HTTP listener immediately for instantaneous probe readiness
  server = app.listen(env.PORT, () => {
    logger.info(`=================================================`);
    logger.info(` GIFT KRO API SERVER INITIALIZED SUCCESSFULLY   `);
    logger.info(` Port:        ${env.PORT}                       `);
    logger.info(` Environment: ${env.NODE_ENV}                   `);
    logger.info(` Client URL:  ${env.CLIENT_URL}                 `);
    logger.info(` Health URI:  http://localhost:${env.PORT}/api/health `);
    logger.info(` API v1 URI:  http://localhost:${env.PORT}/api/v1     `);
    logger.info(`=================================================`);
  });

  // Attempt DB connection in non-blocking background task
  // Server runs resiliently and health endpoint dynamically reflects connection state
  connectDB().catch((err) => {
    logger.warn(`Initial MongoDB connection failed: ${err.message}`);
  });
};

const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Graceful shutdown completed. Exiting process.');
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Forcefully terminating process after shutdown timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

startServer();
