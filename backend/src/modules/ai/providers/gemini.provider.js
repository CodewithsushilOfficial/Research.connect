const axios = require("axios");
const BaseProvider = require("./base.provider");

class GeminiProvider extends BaseProvider {
  constructor() {
    super();
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  }

  async generate(prompt, history = [], options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = options.model || "gemini-1.5-flash";

    if (!apiKey) {
      return {
        text: `### [Gemini Simulation] "${prompt}"\n\n*(Notice: GEMINI_API_KEY not configured. Running in simulation mode)*`,
        promptTokens: prompt.split(" ").length,
        completionTokens: 20,
      };
    }

    const messages = [
      { role: "system", content: "You are an expert academic co-pilot." },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: prompt }
    ];

    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${apiKey}`,
        {
          model,
          messages,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return {
        text: response.data.choices[0].message.content,
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
      };
    } catch (error) {
      console.error("Gemini API error:", error.response?.data || error.message);
      throw new Error(`Gemini Gateway error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async stream(prompt, history = [], options = {}, onChunk) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = options.model || "gemini-1.5-flash";

    if (!apiKey) {
      const text = `### [Gemini Stream Simulation] "${prompt}"\n\n*(Notice: GEMINI_API_KEY not configured. Running in simulation mode)*`;
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

    const messages = [
      { role: "system", content: "You are an expert academic co-pilot." },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: prompt }
    ];

    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${apiKey}`,
        {
          model,
          messages,
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          stream: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "stream",
        }
      );

      return new Promise((resolve, reject) => {
        let buffer = "";
        let completionTokens = 0;

        response.data.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine.startsWith("data: ")) continue;
            const jsonStr = cleanLine.replace("data: ", "");
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.choices[0]?.delta?.content || "";
              if (text) {
                onChunk(text);
                completionTokens++;
              }
            } catch (e) {}
          }
        });

        response.data.on("end", () => {
          resolve({
            promptTokens: prompt.split(" ").length,
            completionTokens,
          });
        });

        response.data.on("error", (err) => reject(err));
      });
    } catch (error) {
      console.error("Gemini stream error:", error.message);
      throw new Error(`Gemini stream error: ${error.message}`);
    }
  }
}

module.exports = new GeminiProvider();
