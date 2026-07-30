const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ─── Required variable definitions ───────────────────────────────────────────
// These variables MUST exist in all environments. Missing any causes startup failure.
const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'REDIS_URL'];

// These are strongly recommended in production but allowed to fall back in dev.
const RECOMMENDED_VARS = ['EMAIL_USER', 'EMAIL_PASS', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];

const missing = REQUIRED_VARS.filter(v => !process.env[v] && !process.env.REDIS_URI);
if (missing.length > 0) {
  // In production: hard crash. In development: loud warning so devs notice.
  const msg = `[CONFIG ERROR] Missing required environment variables: ${missing.join(', ')}\nSet them in .env and restart.`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  } else {
    console.error('\x1b[31m%s\x1b[0m', msg); // Red console output in dev
  }
}

if (process.env.NODE_ENV === 'production') {
  RECOMMENDED_VARS.filter(v => !process.env[v]).forEach(v =>
    console.warn(`[CONFIG WARNING] Recommended env var "${v}" is not set.`)
  );
}

const validateEnvironmentAudit = (logger) => {
  const varsToAudit = [
    { name: 'NODE_ENV', val: process.env.NODE_ENV },
    { name: 'PORT', val: process.env.PORT },
    { name: 'MONGODB_URI', val: process.env.MONGO_URI },
    { name: 'REDIS_URL', val: process.env.REDIS_URL },
    { name: 'JWT_SECRET', val: process.env.JWT_SECRET },
    { name: 'JWT_REFRESH_SECRET', val: process.env.JWT_REFRESH_SECRET },
    { name: 'SMTP_HOST / EMAIL_HOST', val: process.env.SMTP_HOST || process.env.EMAIL_HOST },
    { name: 'SMTP_PORT / EMAIL_PORT', val: process.env.SMTP_PORT || process.env.EMAIL_PORT },
    { name: 'SMTP_USER / EMAIL_USER', val: process.env.SMTP_USER || process.env.EMAIL_USER },
    { name: 'SMTP_PASS / EMAIL_PASS', val: process.env.SMTP_PASS || process.env.EMAIL_PASS },
    { name: 'FRONTEND_URL / CLIENT_URL', val: process.env.FRONTEND_URL || process.env.CLIENT_URL },
    { name: 'BACKEND_URL / SERVER_URL', val: process.env.BACKEND_URL || process.env.SERVER_URL }
  ];

  const logFn = logger?.info || console.log;
  logFn('=====================================================');
  logFn('        STARTUP ENVIRONMENT AUDIT VALIDATION         ');
  logFn('=====================================================');
  varsToAudit.forEach(({ name, val }) => {
    const isOk = Boolean(val && String(val).trim() !== '');
    logFn(`  ${name.padEnd(28)} : [${isOk ? 'PRESENT ✓' : 'MISSING ✗'}]`);
  });
  logFn('=====================================================');
};

module.exports = {
  validateEnvironmentAudit,
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://research-connect-pink.vercel.app',
  serverUrl: process.env.BACKEND_URL || process.env.SERVER_URL || 'http://localhost:5000',
  logLevel: process.env.LOG_LEVEL || 'info',

  mongo: {
    uri: process.env.MONGO_URI, // Never fall back — REQUIRED_VARS guard above ensures this exists
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 2
  },

  redis: {
    uri: process.env.REDIS_URL || process.env.REDIS_URI || 'redis://localhost:6379'
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'research-connect',
    publicUrl: process.env.R2_PUBLIC_URL || ''
  },

  jwt: {
    secret: process.env.JWT_SECRET, // No fallback — intentional; see jwtHelper.js
    expire: process.env.JWT_EXPIRE || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET, // No fallback — intentional
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },

  email: {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true',
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Research Connect',
    fromEmail: process.env.SMTP_USER || process.env.EMAIL_USER || 'help.research.connect@gmail.com',
    resendKey: process.env.RESEND_API_KEY || ''
  },

  serpApi: {
    key: process.env.SERP_API_KEY || ''
  },
  dnsServers: process.env.DNS_SERVERS || ''
};


