const aiGatewayService = require("./aiGateway.service");

class JournalService {
  /**
   * Recommends optimal academic journals for publication
   */
  async recommendJournals(params) {
    params.prompt = `Analyze the following abstract, title, or project details. Recommend the top 4 optimal peer-reviewed journals for submission. For each, specify its impact factor range, review turnaround cycle, open-access status, a match percentage score, and submission strategy tips:\n\n${params.prompt}`;
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new JournalService();
