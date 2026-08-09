const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} ProfileAnalytics
 * @property {mongoose.Types.ObjectId} userId - Reference to User whose daily profile interactions are aggregated.
 * @property {number} views - Number of public profile page visits recorded for the day.
 * @property {number} downloads - Number of CV and full-text downloads initiated from the profile.
 * @property {number} shares - Number of profile and citation shares performed.
 * @property {Date} date - Day boundary timestamp (e.g., midnight YYYY-MM-DD UTC) representing the metrics interval.
 */

const ProfileAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      required: true, // Truncated to day boundary (e.g. YYYY-MM-DD)
      index: true
    }
  },
  {
    timestamps: true
  }
);

ProfileAnalyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

const ProfileAnalytics = mongoose.model('ProfileAnalytics', ProfileAnalyticsSchema);
module.exports = ProfileAnalytics;
