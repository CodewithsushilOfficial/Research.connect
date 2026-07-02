const BaseRepository = require("../../../common/repository/base.repository");
const AiSession = require("../../../models/AiSession");

class AiSessionRepository extends BaseRepository {
  constructor() {
    super(AiSession);
  }

  async findUserSessions(userId, workspace = null) {
    const filter = { userId, isDeleted: { $ne: true } };
    if (workspace) {
      filter.workspace = workspace;
    }
    return await this.model.find(filter).sort({ isPinned: -1, updatedAt: -1 });
  }
}

module.exports = new AiSessionRepository();
