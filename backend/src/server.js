require('dotenv').config();
const app = require('./app');
const { connectDB, closeDB } = require('./config/database/connection');
const logger = require('./common/logger/winston');
const { syncDatabaseIndexes } = require('./config/database/indexes');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // Seed AI Templates
    const seederService = require('./modules/ai/services/seeder.service');
    await seederService.seedTemplates();

    // 2. Sync database indexes
    if (process.env.NODE_ENV !== 'test') {
      await syncDatabaseIndexes();
    }

    // 3. Start Express Listener
    const importQueueService = require('./modules/scholar/service/import-queue.service');
    const server = app.listen(PORT, () => {
      logger.info(`Research Connect server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      importQueueService.runQueueWorker();
    });

    // Handle Graceful Shutdowns
    const shutdownGracefully = async (signal) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        // Terminate db connection
        await closeDB();
        logger.info('Database connections closed. Exiting process.');
        process.exit(0);
      });

      // Force shutdown after 10s if graceful fails
      setTimeout(() => {
        logger.error('Forceful shutdown triggered.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
    process.on('SIGINT', () => shutdownGracefully('SIGINT'));

  } catch (error) {
    logger.error('Error starting Research Connect server:', error);
    process.exit(1);
  }
};

// Handle Uncaught Exception events
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception occurred:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

// Nodemon reload trigger to connect cleanly after port release
