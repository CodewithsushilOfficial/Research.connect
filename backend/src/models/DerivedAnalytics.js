const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} DerivedAnalytics
 * @property {mongoose.Types.ObjectId} userId - Reference to User whose derived metrics are cached.
 * @property {number} totalPublications - Total number of research papers published by the user.
 * @property {number} journalPapers - Count of indexed journal articles.
 * @property {number} conferencePapers - Count of indexed conference proceedings.
 * @property {number} averageCitations - Mean citations per publication.
 * @property {number} averagePublicationsPerYear - Average publishing velocity per active research year.
 * @property {number} [mostActiveResearchYear] - Calendar year with the highest publication output.
 * @property {mongoose.Types.ObjectId} [mostCitedPublication] - Reference to the user's highest-cited work.
 * @property {string} mostCitedPublicationTitle - Title of the most cited paper.
 * @property {number} mostCitedPublicationCitations - Peak citation count achieved by a single publication.
 * @property {string} mostFrequentKeyword - Primary recurring keyword extracted from research topics.
 * @property {string} topResearchDomain - Primary academic field or discipline.
 * @property {number} researchExperience - Active publishing span in years.
 * @property {number} citationGrowthRate - Year-over-year citation growth percentage.
 * @property {number} publicationGrowthRate - Year-over-year publication growth percentage.
 * @property {string} trendingResearchArea - Emerging topic area based on recent publications.
 * @property {mongoose.Types.ObjectId} [latestPublication] - Reference to the most recently published paper.
 * @property {mongoose.Types.ObjectId} [oldestPublication] - Reference to the earliest published paper.
 * @property {number} researchScore - Composite research impact score.
 */

const DerivedAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    totalPublications: {
      type: Number,
      default: 0
    },
    journalPapers: {
      type: Number,
      default: 0
    },
    conferencePapers: {
      type: Number,
      default: 0
    },
    averageCitations: {
      type: Number,
      default: 0
    },
    averagePublicationsPerYear: {
      type: Number,
      default: 0
    },
    mostActiveResearchYear: {
      type: Number
    },
    mostCitedPublication: {
      type: Schema.Types.ObjectId,
      ref: 'Publication'
    },
    mostCitedPublicationTitle: {
      type: String,
      default: ''
    },
    mostCitedPublicationCitations: {
      type: Number,
      default: 0
    },
    mostFrequentKeyword: {
      type: String,
      default: ''
    },
    topResearchDomain: {
      type: String,
      default: ''
    },
    researchExperience: {
      type: Number,
      default: 0
    },
    citationGrowthRate: {
      type: Number,
      default: 0
    },
    publicationGrowthRate: {
      type: Number,
      default: 0
    },
    trendingResearchArea: {
      type: String,
      default: ''
    },
    latestPublication: {
      type: Schema.Types.ObjectId,
      ref: 'Publication'
    },
    latestPublicationTitle: {
      type: String,
      default: ''
    },
    oldestPublication: {
      type: Schema.Types.ObjectId,
      ref: 'Publication'
    },
    oldestPublicationTitle: {
      type: String,
      default: ''
    },
    researchScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const DerivedAnalytics = mongoose.model('DerivedAnalytics', DerivedAnalyticsSchema);
module.exports = DerivedAnalytics;
