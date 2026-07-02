const { OpenAI } = require("openai");
const BaseProvider = require("./base.provider");
const { ValidationError } = require("../../../common/errors/AppError");

class NvidiaProvider extends BaseProvider {
  constructor() {
    super();
    this.client = null;
  }

  /**
   * Cleans raw URL inputs to prevent OpenAI SDK endpoint duplication (e.g. double /chat/completions)
   */
  sanitizeBaseURL(rawURL) {
    if (!rawURL) return "https://integrate.api.nvidia.com/v1";
    let url = rawURL.trim();
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    if (url.endsWith("/chat/completions")) {
      url = url.slice(0, -"/chat/completions".length);
    }
    if (url.endsWith("/chat")) {
      url = url.slice(0, -5);
    }
    return url;
  }

  /**
   * Lazy load the OpenAI-compatible SDK instance configured with NVIDIA NIM
   */
  getClient() {
    if (this.client) return this.client;
    
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    const baseURL = this.sanitizeBaseURL(process.env.NVIDIA_NIM_BASE_URL);

    if (!apiKey) {
      throw new ValidationError("NVIDIA NIM API Key is missing. Please configure NVIDIA_NIM_API_KEY in backend/.env file.");
    }

    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS) || 60000;

    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout: timeoutMs,
      maxRetries: 0, // We handle retries and model fallbacks manually
    });

    return this.client;
  }

  /**
   * Executes API call with candidate model progression fallbacks
   */
  async executeWithFallback(prompt, history, options, isStream, onChunkOrData) {
    const client = this.getClient();
    const baseURL = this.sanitizeBaseURL(process.env.NVIDIA_NIM_BASE_URL);
    const resolvedEndpoint = `${baseURL}/chat/completions`;

    // Compile candidate models: 
    // 1. Requested option model
    // 2. NIM default model from config
    // 3. Fallback 1: meta/llama-3.1-8b-instruct
    // 4. Fallback 2: meta/llama-3.1-70b-instruct
    const candidateModels = [];
    if (options.model) {
      candidateModels.push(options.model);
    }
    const envDefaultModel = process.env.NIM_CHAT_MODEL;
    if (envDefaultModel && !candidateModels.includes(envDefaultModel)) {
      candidateModels.push(envDefaultModel);
    }
    const fallback1 = "meta/llama-3.1-8b-instruct";
    const fallback2 = "meta/llama-3.1-70b-instruct";
    
    if (!candidateModels.includes(fallback1)) {
      candidateModels.push(fallback1);
    }
    if (!candidateModels.includes(fallback2)) {
      candidateModels.push(fallback2);
    }

    let lastError = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const currentModel = candidateModels[i];
      // Use a shorter timeout (e.g. 10s) for non-fallback models to fail-fast if they hang
      const isFallback = [fallback1, fallback2].includes(currentModel);
      const attemptTimeout = isFallback ? (parseInt(process.env.AI_TIMEOUT_MS) || 60000) : 10000;

      console.log(`[NVIDIA NIM GATEWAY] Executing request. Configured Model: ${currentModel} | Endpoint: ${resolvedEndpoint} | Timeout: ${attemptTimeout}ms`);

      try {
        const temp = options.temperature !== undefined ? options.temperature : (parseFloat(process.env.AI_TEMPERATURE) || 0.2);
        const maxTokens = options.maxTokens || (parseInt(process.env.AI_MAX_OUTPUT_TOKENS) || 4096);
        const topP = parseFloat(process.env.AI_TOP_P) || 0.95;

        const messages = [
          { 
            role: "system", 
            content: "You are an expert academic research co-pilot. Structure all your responses in professional markdown containing structured tables, bullet points, code blocks, and citations." 
          },
          ...history.map(msg => ({ role: msg.role, content: msg.content })),
          { role: "user", content: prompt }
        ];

        if (isStream) {
          const responseStream = await client.chat.completions.create({
            model: currentModel,
            messages,
            temperature: temp,
            max_tokens: maxTokens,
            top_p: topP,
            stream: true,
          }, {
            timeout: attemptTimeout,
            maxRetries: 0
          });

          let completionTokens = 0;
          for await (const chunk of responseStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              onChunkOrData(text);
              completionTokens++;
            }
          }

          // Log Success for stream
          console.log(`[NVIDIA NIM GATEWAY SUCCESS]`);
          console.log(`- Configured Model: ${currentModel}`);
          console.log(`- Resolved Endpoint: ${resolvedEndpoint}`);
          console.log(`- HTTP Status: 200`);
          console.log(`- Response Body: [SSE Stream Completed]`);

          return {
            promptTokens: Math.round(prompt.length / 4),
            completionTokens,
            usedModel: currentModel,
          };
        } else {
          const response = await client.chat.completions.create({
            model: currentModel,
            messages,
            temperature: temp,
            max_tokens: maxTokens,
            top_p: topP,
            stream: false,
          }, {
            timeout: attemptTimeout,
            maxRetries: 0
          });

          // Log Success for direct call
          console.log(`[NVIDIA NIM GATEWAY SUCCESS]`);
          console.log(`- Configured Model: ${currentModel}`);
          console.log(`- Resolved Endpoint: ${resolvedEndpoint}`);
          console.log(`- HTTP Status: 200`);
          console.log(`- Response Body:`, JSON.stringify(response));

          const choice = response.choices[0];
          return {
            text: choice.message.content,
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            usedModel: currentModel,
          };
        }
      } catch (error) {
        lastError = error;
        
        // Log Error details
        console.error(`[NVIDIA NIM GATEWAY FAILURE] Attempt failed for model: ${currentModel}`);
        console.error(`- Configured Model: ${currentModel}`);
        console.error(`- Resolved Endpoint: ${resolvedEndpoint}`);
        console.error(`- HTTP Status: ${error.status || error.statusCode || 500}`);
        console.error(`- Response Body:`, JSON.stringify(error.body || error.message || error));

        // Skip to next candidate
        if (i < candidateModels.length - 1) {
          console.warn(`[NVIDIA NIM GATEWAY] Retrying next fallback candidate...`);
        }
      }
    }

    // Exhausted candidate list
    throw new Error(`NVIDIA NIM integration failed. All models failed. Last error: ${lastError.message}`);
  }

  /**
   * Non-streaming chat completion
   */
  async generate(prompt, history = [], options = {}) {
    return await this.executeWithFallback(prompt, history, options, false);
  }

  /**
   * Streaming chat completion
   */
  async stream(prompt, history = [], options = {}, onChunk) {
    return await this.executeWithFallback(prompt, history, options, true, onChunk);
  }

  /**
   * Generate vector embeddings
   */
  async generateEmbeddings(text, options = {}) {
    const client = this.getClient();
    const model = options.model || process.env.NIM_EMBEDDING_MODEL || "nvidia/llama-3.2-nv-embedqa-1b-v2";
    const baseURL = this.sanitizeBaseURL(process.env.NVIDIA_NIM_BASE_URL);
    const resolvedEndpoint = `${baseURL}/embeddings`;

    console.log(`[NVIDIA NIM EMBEDDING] Generating vector embedding. Configured Model: ${model} | Endpoint: ${resolvedEndpoint}`);

    try {
      const response = await client.embeddings.create({
        model,
        input: text,
      });

      console.log(`[NVIDIA NIM EMBEDDING SUCCESS]`);
      console.log(`- Configured Model: ${model}`);
      console.log(`- Resolved Endpoint: ${resolvedEndpoint}`);
      console.log(`- HTTP Status: 200`);

      return {
        embedding: response.data[0].embedding,
        promptTokens: response.usage?.prompt_tokens || 0,
      };
    } catch (error) {
      console.error(`[NVIDIA NIM EMBEDDING FAILURE]`);
      console.error(`- Configured Model: ${model}`);
      console.error(`- Resolved Endpoint: ${resolvedEndpoint}`);
      console.error(`- HTTP Status: ${error.status || error.statusCode || 500}`);
      console.error(`- Response Body:`, JSON.stringify(error.body || error.message || error));
      
      throw new Error(`NVIDIA NIM Embedding error: ${error.message}`);
    }
  }
}

module.exports = new NvidiaProvider();
