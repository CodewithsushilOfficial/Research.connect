const BaseRepository = require('../../../common/repository/base.repository');
const DerivedAnalytics = require('../../../models/DerivedAnalytics');

/**
 * @class DerivedAnalyticsRepository
 * @extends BaseRepository
 * @description Data access layer for retrieving and upserting pre-aggregated scholar performance metrics.
 * Inherits standard CRUD and aggregation capabilities from BaseRepository.
 */
class DerivedAnalyticsRepository extends BaseRepository {
  constructor() {
    super(DerivedAnalytics);
  }

  /**
   * Find pre-aggregated derived analytics record by researcher user ID.
   * @param {string|mongoose.Types.ObjectId} userId - User identifier.
   * @returns {Promise<DerivedAnalytics|null>} Mongoose document or null.
   */
  async findByUserId(userId) {
    return await this.model.findOne({ userId });
  }
}

module.exports = new DerivedAnalyticsRepository();
