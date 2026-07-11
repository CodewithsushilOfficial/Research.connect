const mongoose = require('mongoose');
const logger = require('../../common/logger/winston');
const dns = require('dns').promises;

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}

const options = {
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10,
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority' }
};

let connectionPromise = null;
let retryCount = 0;

/**
 * Extract SRV record name from mongodb+srv connection string
 */
function getSrvRecordName(uri) {
  if (!uri.startsWith('mongodb+srv://')) return null;
  const match = uri.match(/@([^/?#]+)/);
  if (!match) return null;
  return `_mongodb._tcp.${match[1]}`;
}

/**
 * Test system DNS SRV capabilities and set public fallbacks if resolution fails
 */
async function checkAndApplyDNSFallback(uri) {
  const srvRecord = getSrvRecordName(uri);
  if (!srvRecord) return;

  try {
    await dns.resolveSrv(srvRecord);
  } catch (err) {
    logger.warn(`System DNS failed to resolve SRV record (${err.message}). Applying Google/Cloudflare DNS fallback...`);
    try {
      require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (dnsErr) {
      logger.error('Failed to set fallback DNS servers:', dnsErr.message);
    }
  }
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      // Check if system DNS can resolve SRV record, otherwise apply fallback
      await checkAndApplyDNSFallback(MONGO_URI);

      logger.info('Attempting to connect to MongoDB...');
      await mongoose.connect(MONGO_URI, options);
      retryCount = 0;
      
      // Asynchronously trigger database seeding check
      const { seedData } = require('./seeder');
      seedData().catch(err => logger.error('Seeder execution error:', err));

      return mongoose.connection;
    } catch (error) {
      retryCount++;
      const delay = Math.min(Math.pow(2, retryCount) * 1000, 30000);
      logger.error(`MongoDB connection failed (attempt ${retryCount}): ${error.message}`);
      logger.info(`Retrying in ${delay}ms...`);
      
      connectionPromise = null;
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB();
    }
  })();

  return connectionPromise;
};

mongoose.connection.on('connected', () => logger.info('MongoDB connected.'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
  connectionPromise = null; // Clear cached connection promise on disconnect
});

const checkHealth = () => {
  const readyState = mongoose.connection.readyState;
  const isHealthy = readyState === 1;
  
  return {
    isHealthy,
    status: ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'][readyState] || 'unknown',
    replicaSet: mongoose.connection.getClient()?.topology?.description?.setName || 'n/a'
  };
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed.');
  }
};

module.exports = {
  connectDB,
  checkHealth,
  closeDB
};
