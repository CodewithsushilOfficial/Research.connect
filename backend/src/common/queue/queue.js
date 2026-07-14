const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('../logger/winston');

// Redis URL fallback to localhost
const REDIS_URI = process.env.REDIS_URL || 'redis://localhost:6379';

// ioredis connection instance
let connection = null;
try {
  const options = {
    maxRetriesPerRequest: null // Required by BullMQ
  };
  connection = new IORedis(REDIS_URI, options);
  logger.info('[BULLMQ] Connected to Redis for queue management.');
} catch (err) {
  logger.error('[BULLMQ INIT ERROR] Failed to connect to Redis:', err);
}

const queues = {};
const workers = {};

class BullMQAdapter {
  /**
   * Enqueue a job to BullMQ
   */
  async enqueue(queueName, jobData) {
    try {
      if (!queues[queueName]) {
        queues[queueName] = new Queue(queueName, {
          connection,
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 2000
            },
            removeOnComplete: true,
            removeOnFail: false
          }
        });
      }
      
      const job = await queues[queueName].add('job', jobData);
      logger.info(`[BULLMQ] Job ${job.id} successfully enqueued to ${queueName}`);
      return job.id;
    } catch (err) {
      logger.error(`[BULLMQ ERROR] Failed to enqueue job to ${queueName}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Register and start a background worker loop for a queue
   */
  process(queueName, handler) {
    if (workers[queueName]) {
      logger.warn(`[BULLMQ] Worker for queue ${queueName} already registered.`);
      return;
    }

    logger.info(`[BULLMQ] Starting Worker loop for queue: ${queueName}`);
    
    const worker = new Worker(queueName, async (job) => {
      // Execute the original handler passing job data
      return handler(job.data);
    }, {
      connection,
      concurrency: 10 // process up to 10 jobs concurrently
    });

    worker.on('completed', (job) => {
      logger.info(`[BULLMQ SUCCESS] Job ${job.id} in queue ${queueName} completed.`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[BULLMQ FAILED] Job ${job?.id} in queue ${queueName} failed with error: ${err.message}`);
    });

    workers[queueName] = worker;
  }
}

module.exports = new BullMQAdapter();
