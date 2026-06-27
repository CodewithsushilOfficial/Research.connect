import express from 'express';
import healthRouter from './health.routes.js';

const router = express.Router();

// Mount API Sub-routers
router.use('/health', healthRouter);

export default router;
