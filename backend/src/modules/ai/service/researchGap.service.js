const aiGatewayService = require("./aiGateway.service");

class ResearchGapService {
  /**
   * Identifies unexplored research gaps and suggests research questions
   */
  async findGaps(params) {
    params.prompt = `Analyze the current state of literature and formulate 3 critical, unaddressed research gaps for the following topic. For each gap, explain the issue, why it exists, and propose a precise, testable research question:\n\n${params.prompt}`;
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new ResearchGapService();
