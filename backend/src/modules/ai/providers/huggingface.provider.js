const BaseProvider = require("./base.provider");

class HuggingfaceProvider extends BaseProvider {
  async generate(prompt, history = [], options = {}) {
    const text = `### [Hugging Face Inference] "${prompt}"\n\n*(Notice: HuggingFace integration is in simulation mode)*`;
    return {
      text,
      promptTokens: prompt.split(" ").length,
      completionTokens: text.split(" ").length,
    };
  }

  async stream(prompt, history = [], options = {}, onChunk) {
    const text = `### [Hugging Face Stream] "${prompt}"\n\nStreaming from Hugging Face adapter...\n\n*(Notice: HuggingFace integration is in simulation mode)*`;
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

module.exports = new HuggingfaceProvider();
