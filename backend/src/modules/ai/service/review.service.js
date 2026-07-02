const aiGatewayService = require("./aiGateway.service");

class ReviewService {
  /**
   * Generates literature reviews or peer reviewer feedback
   */
  async review(params) {
    if (params.workspace === "literature-review") {
      params.prompt = `Conduct a comprehensive, structured academic literature review on the following topic. Synthesize recent paradigms/frameworks, perform a comparative analysis of key literature, and list open avenues for future research:\n\n${params.prompt}`;
    } else {
      // paper-reviewer or reviewer
      params.prompt = `Act as a senior double-blind peer reviewer for a leading academic journal. Critique the following abstract, draft, or topic. Provide decision recommendations, key strengths, critical weaknesses (methodology, validation, comparisons), and actionable revision suggestions:\n\n${params.prompt}`;
    }
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new ReviewService();
