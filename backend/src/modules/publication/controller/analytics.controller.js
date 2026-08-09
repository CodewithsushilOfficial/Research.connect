const analyticsService = require('../service/analytics.service');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');

/**
 * @class AnalyticsController
 * @description Controller managing HTTP interactions for publication-level and profile-level analytics.
 * Sanitizes input parameters, handles route context, and formats standardized JSON responses.
 */
class AnalyticsController {
  /**
   * GET /api/v1/publications/:id/analytics
   * Retrieves summary performance metrics, rolling 7d/30d views, and engagement counts for a single publication.
   */
  getPublicationAnalytics = asyncHandler(async (req, res) => {
    const result = await analyticsService.getPublicationAnalytics(req.params.id, req.user._id);
    return res.success('Analytics retrieved successfully.', result);
  });

  /**
   * GET /api/v1/publications/:id/analytics/views
   * Retrieves time-series views dataset grouped by day for the requested historical period (7d, 30d, 90d).
   */
  getViewsTimeline = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    const result = await analyticsService.getViewsTimeline(req.params.id, period);
    return res.success('Views timeline retrieved.', result);
  });

  /**
   * GET /api/v1/publications/:id/analytics/downloads
   * Retrieves time-series PDF/full-text download dataset grouped by day for the requested period.
   */
  getDownloadsTimeline = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    const result = await analyticsService.getDownloadsTimeline(req.params.id, period);
    return res.success('Downloads timeline retrieved.', result);
  });

  /**
   * GET /api/v1/profile/:profileSlug/publication-analytics
   * Retrieves profile-wide aggregated publication performance, type distribution, and top-performing publications.
   */
  getProfileAnalytics = asyncHandler(async (req, res) => {
    const result = await analyticsService.getProfilePublicationAnalytics(
      req.params.profileSlug,
      req.user._id
    );
    return res.success('Profile analytics retrieved.', result);
  });
}

module.exports = new AnalyticsController();
