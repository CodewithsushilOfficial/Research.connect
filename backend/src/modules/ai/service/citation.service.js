const aiGatewayService = require("./aiGateway.service");

class CitationService {
  /**
   * Generates citations in academic formats
   */
  async generateCitations(params) {
    params.prompt = `Generate formatted academic citations in APA (7th Edition), MLA (9th Edition), Chicago Style, Harvard Style, and BibTeX format for the following source reference:\n\n${params.prompt}`;
    return await aiGatewayService.streamResponse(params);
  }
}

module.exports = new CitationService();
