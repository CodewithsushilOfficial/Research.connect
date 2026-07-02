const nvidiaProvider = require("../providers/nvidia.provider");

class EmbeddingService {
  /**
   * Generates a vector embedding for the input text using the configured provider
   * @param {string} text - Input text to embed
   * @param {object} options - Custom options (e.g. model)
   * @returns {Promise<object>} - Resolves to { embedding: number[], promptTokens: number }
   */
  async getEmbedding(text, options = {}) {
    return await nvidiaProvider.generateEmbeddings(text, options);
  }
}

module.exports = new EmbeddingService();
