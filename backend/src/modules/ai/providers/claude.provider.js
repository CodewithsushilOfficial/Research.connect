const BaseProvider = require("./base.provider");

class ClaudeProvider extends BaseProvider {
  async generate(prompt, history = [], options = {}) {
    const text = `### [Anthropic Claude] "${prompt}"\n\n*(Notice: Claude integration is in simulation mode)*`;
    return {
      text,
      promptTokens: prompt.split(" ").length,
      completionTokens: text.split(" ").length,
    };
  }

  async stream(prompt, history = [], options = {}, onChunk) {
    const text = `### [Anthropic Claude Stream] "${prompt}"\n\nThis is a streaming response from the Claude adapter...\n\n*(Notice: Claude integration is in simulation mode)*`;
    const words = text.split(" ");
    let index = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (index < words.length) {
          onChunk(words[index] + " ");
          index++;
        } else {
          clearInterval(interval);
          resolve({ promptTokens: prompt.split(" ").length, completionTokens: words.length });
        }
      }, 30);
    });
  }
}

module.exports = new ClaudeProvider();
