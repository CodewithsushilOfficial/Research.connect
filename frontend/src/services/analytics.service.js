/**
 * @module services/analytics.service
 * @description Frontend API service for fetching publication time-series, summary KPIs, and researcher profile analytics.
 * Connects through axiosInstance with automatic authorization headers and error interceptors.
 */

import axiosInstance from '../api/axiosInstance';

class AnalyticsService {
  /**
   * Get full analytics summary for a single publication.
   * @param {string} publicationId - ID of the target publication.
   * @returns {Promise<Object>} Summary statistics and 7d/30d activity.
   */
  async getPublicationAnalytics(publicationId) {
    const { data } = await axiosInstance.get(`/v1/publications/${publicationId}/analytics`);
    return data?.data || {};
  }

  /**
   * Get views timeline (day-by-day).
   * @param {string} publicationId - ID of the target publication.
   * @param {'7d'|'30d'|'90d'} [period='30d'] - Historical duration filter.
   * @returns {Promise<{period: string, timeline: Array<{date: string, views: number}>}>} Time-series views array.
   */
  async getViewsTimeline(publicationId, period = '30d') {
    const { data } = await axiosInstance.get(`/v1/publications/${publicationId}/analytics/views`, {
      params: { period }
    });
    return data?.data || {};
  }

  /**
   * Get downloads timeline (day-by-day).
   * @param {string} publicationId - ID of the target publication.
   * @param {'7d'|'30d'|'90d'} [period='30d'] - Historical duration filter.
   * @returns {Promise<{period: string, timeline: Array<{date: string, downloads: number}>}>} Time-series downloads array.
   */
  async getDownloadsTimeline(publicationId, period = '30d') {
    const { data } = await axiosInstance.get(`/v1/publications/${publicationId}/analytics/downloads`, {
      params: { period }
    });
    return data?.data || {};
  }

  /**
   * Get profile-level aggregate analytics across all researcher publications.
   * @param {string} profileSlug - Public slug identifying the researcher.
   * @returns {Promise<Object>} Aggregated profile summary, category distribution, and top works.
   */
  async getProfileAnalytics(profileSlug) {
    const { data } = await axiosInstance.get(`/v1/publications/profile-analytics/${profileSlug}`);
    return data?.data || {};
  }
}

export default new AnalyticsService();
