const aiGatewayService = require("./aiGateway.service");

class SummaryService {
  /**
   * Generates paper summaries and executive briefs
   */
  async summarize(params) {
    params.prompt = `Please generate a comprehensive, structured paper summary for the following topic or text. Expose the primary objective, core methodology, key findings, and empirical limitations:\n\n${params.prompt}`;
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new SummaryService();
