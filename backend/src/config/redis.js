const { createClient } = require('redis');
const logger = require('../common/logger/winston');

const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URI,
  socket: {
    reconnectStrategy: (retries) => {
      // Stop retrying after 3 attempts
      if (retries > 3) {
        return false;
      }
      return 1000;
    }
  }
});

redisClient.on('error', (err) => {
  logger.error('[REDIS CLIENT ERROR]', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client initiating connection...');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected and ready.');
});

module.exports = redisClient;
