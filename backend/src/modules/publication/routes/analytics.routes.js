/**
 * @module modules/publication/routes/analytics.routes
 * @description Express routing definitions for publication metrics and time-series analytics.
 * Enforces JWT authentication middleware across all endpoints to ensure privacy and author-only access.
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const analyticsController = require('../controller/analytics.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');

// All analytics require authentication (owner-only data access)

/**
 * @route GET /api/v1/publications/:id/analytics
 * @desc Get publication summary KPIs (views, downloads, bookmarks, citations, rolling activity)
 * @access Private (Publication Owner)
 */
router.get('/', authMiddleware, analyticsController.getPublicationAnalytics);

/**
 * @route GET /api/v1/publications/:id/analytics/views
 * @desc Get daily views time-series aggregation for line chart visualization (7d, 30d, 90d)
 * @access Private (Publication Owner)
 */
router.get('/views', authMiddleware, analyticsController.getViewsTimeline);

/**
 * @route GET /api/v1/publications/:id/analytics/downloads
 * @desc Get daily downloads time-series aggregation for line chart visualization (7d, 30d, 90d)
 * @access Private (Publication Owner)
 */
router.get('/downloads', authMiddleware, analyticsController.getDownloadsTimeline);

module.exports = router;
