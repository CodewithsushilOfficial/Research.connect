class BaseProvider {
  /**
   * Generates a non-streaming chat completion
   * @param {string} prompt - Current prompt
   * @param {Array} history - Previous messages array: [{ role: 'user'|'assistant', content: string }]
   * @param {object} options - Generation parameters: { model, temperature, maxTokens }
   * @returns {Promise<object>} - Resolves to { text: string, promptTokens: number, completionTokens: number }
   */
  async generate(prompt, history = [], options = {}) {
    throw new Error("generate() method must be implemented by the provider adapter.");
  }

  /**
   * Streams a chat completion response
   * @param {string} prompt - Current prompt
   * @param {Array} history - Previous messages array
   * @param {object} options - Generation parameters
   * @param {function} onChunk - Callback triggered on each text chunk: (textChunk) => void
   * @returns {Promise<object>} - Resolves to completion metadata: { promptTokens: number, completionTokens: number }
   */
  async stream(prompt, history = [], options = {}, onChunk) {
    throw new Error("stream() method must be implemented by the provider adapter.");
  }
}

module.exports = BaseProvider;
