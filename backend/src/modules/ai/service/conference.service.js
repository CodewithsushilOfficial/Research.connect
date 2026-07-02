const aiGatewayService = require("./aiGateway.service");

class ConferenceService {
  /**
   * Recommends optimal academic conferences for publication
   */
  async recommendConferences(params) {
    params.prompt = `Recommend the top 3 optimal upcoming international conferences (such as IEEE, ACM, or top-tier domains) matching the following research query or draft details. For each conference, list the location, submission deadline window, average review duration, core focus areas, and suitability score:\n\n${params.prompt}`;
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new ConferenceService();
