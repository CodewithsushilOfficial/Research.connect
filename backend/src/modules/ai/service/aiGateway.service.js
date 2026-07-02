const AiSession = require("../../../models/AiSession");
const AiMessage = require("../../../models/AiMessage");
const AiUsage = require("../../../models/AiUsage");
const { ValidationError, NotFoundError } = require("../../../common/errors/AppError");

// Import Provider Adapters
const nvidiaProvider = require("../providers/nvidia.provider");
const openaiProvider = require("../providers/openai.provider");
const geminiProvider = require("../providers/gemini.provider");
const claudeProvider = require("../providers/claude.provider");
const huggingfaceProvider = require("../providers/huggingface.provider");

const providersMap = {
  "nvidia": nvidiaProvider,
  "NVIDIA NIM": nvidiaProvider,
  "openai": openaiProvider,
  "OpenAI": openaiProvider,
  "gemini": geminiProvider,
  "Gemini": geminiProvider,
  "claude": claudeProvider,
  "Claude": claudeProvider,
  "huggingface": huggingfaceProvider,
  "HuggingFace": huggingfaceProvider,
};

const modelConfigKeys = {
  "chat": "NIM_CHAT_MODEL",
  "paper-summary": "NIM_CHAT_MODEL",
  "pdf-chat": "NIM_CHAT_MODEL",
  
  "literature-review": "NIM_REASONING_MODEL",
  "research-assistant": "NIM_REASONING_MODEL",
  "research-gap": "NIM_REASONING_MODEL",
  "methodology": "NIM_REASONING_MODEL",
  "methodology-generator": "NIM_REASONING_MODEL",
  "reviewer": "NIM_REASONING_MODEL",
  "paper-review": "NIM_REASONING_MODEL",
  "paper-reviewer": "NIM_REASONING_MODEL",
  "proposal": "NIM_REASONING_MODEL",
  "proposal-generator": "NIM_REASONING_MODEL",

  "thesis": "NIM_LONG_CONTEXT_MODEL",
  "thesis-assistant": "NIM_LONG_CONTEXT_MODEL",
  "journal": "NIM_LONG_CONTEXT_MODEL",
  "journal-recommendation": "NIM_LONG_CONTEXT_MODEL",
  "conference": "NIM_LONG_CONTEXT_MODEL",
  "conference-recommendation": "NIM_LONG_CONTEXT_MODEL",

  "citation": "NIM_FAST_MODEL",
  "citation-generator": "NIM_FAST_MODEL",

  "code-generation": "NIM_CODE_MODEL"
};

class AiGatewayService {
  constructor() {
    this.validateConfig();
  }

  /**
   * Validate config on startup
   */
  validateConfig() {
    const defaultProvider = process.env.AI_DEFAULT_PROVIDER || "nvidia";
    if (defaultProvider === "nvidia" && !process.env.NVIDIA_NIM_API_KEY) {
      console.warn("⚠️ [AI GATEWAY WARNING]: NVIDIA_NIM_API_KEY is not defined in backend/.env.");
    } else {
      console.log(`✅ [AI GATEWAY]: Configured default provider is '${defaultProvider}'.`);
    }
  }

  /**
   * Resolve provider adapter
   */
  getProvider(providerName) {
    const resolvedName = providerName || process.env.AI_DEFAULT_PROVIDER || "NVIDIA NIM";
    const provider = providersMap[resolvedName];
    if (!provider) {
      // Default fallback
      return nvidiaProvider;
    }
    return provider;
  }

  /**
   * Resolve model for the task/workspace type based on .env config mapping
   */
  resolveModel(workspace, providerName, requestedModel = null) {
    // If the provider is not NVIDIA NIM, and a specific model was passed, use it
    const provider = providerName || process.env.AI_DEFAULT_PROVIDER || "nvidia";
    const isNvidia = ["nvidia", "NVIDIA NIM"].includes(provider);

    if (!isNvidia && requestedModel) {
      return requestedModel;
    }

    const configKey = modelConfigKeys[workspace] || "NIM_CHAT_MODEL";
    let model = process.env[configKey];

    if (!model) {
      switch (configKey) {
        case "NIM_CHAT_MODEL":
          model = "nvidia/nemotron-3-ultra-550b-a55b";
          break;
        case "NIM_REASONING_MODEL":
          model = "deepseek-ai/deepseek-r1";
          break;
        case "NIM_FAST_MODEL":
          model = "meta/llama-3.1-8b-instruct";
          break;
        case "NIM_LONG_CONTEXT_MODEL":
          model = "meta/llama-3.1-70b-instruct";
          break;
        case "NIM_CODE_MODEL":
          model = "qwen/qwen2.5-coder-32b-instruct";
          break;
        default:
          model = "nvidia/nemotron-3-ultra-550b-a55b";
      }
    }

    return model;
  }

  /**
   * Streams responses using Server-Sent Events (SSE) and logs results to MongoDB
   */
  async streamResponse({
    userId,
    workspace,
    prompt,
    sessionId = null,
    provider = null,
    model = null,
    temperature = null,
    contextLength = null,
    attachments = [],
    onChunk,
  }) {
    if (!prompt || !prompt.trim()) {
      throw new ValidationError("Prompt is required.");
    }

    const activeProviderName = provider || process.env.AI_DEFAULT_PROVIDER || "NVIDIA NIM";
    const activeProvider = this.getProvider(activeProviderName);
    const activeModel = this.resolveModel(workspace, activeProviderName, model);
    const activeTemp = temperature !== undefined ? temperature : (parseFloat(process.env.AI_TEMPERATURE) || 0.2);
    const activeContext = contextLength || (parseInt(process.env.AI_MAX_OUTPUT_TOKENS) || 4096);

    let session;
    if (sessionId) {
      session = await AiSession.findOne({ _id: sessionId, userId, isDeleted: { $ne: true } });
      if (!session) {
        throw new NotFoundError("AI Session not found.");
      }
    } else {
      const title = prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt;
      session = await AiSession.create({
        userId,
        workspace,
        title,
        provider: activeProviderName,
        model: activeModel,
        temperature: activeTemp,
        contextLength: activeContext,
      });
    }

    const startTime = Date.now();

    // 1. Save User Message
    const userMessage = await AiMessage.create({
      sessionId: session._id,
      role: "user",
      content: prompt,
      attachments,
    });

    // 2. Load context history (last 10 messages)
    const rawHistory = await AiMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(10);
    
    const history = rawHistory
      .filter(m => m._id.toString() !== userMessage._id.toString())
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    let fullResponseText = "";

    // 3. Call Provider Stream method
    const streamMeta = await activeProvider.stream(
      prompt,
      history,
      {
        model: activeModel,
        temperature: activeTemp,
        maxTokens: activeContext,
        workspace,
      },
      (chunk) => {
        fullResponseText += chunk;
        onChunk(chunk);
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Token statistics
    const promptTokens = streamMeta.promptTokens || Math.round(prompt.length / 4);
    const completionTokens = streamMeta.completionTokens || Math.round(fullResponseText.length / 4);
    const totalTokens = promptTokens + completionTokens;

    // Estimate cost ($0.002 per 1K tokens standard proxy)
    const cost = (totalTokens / 1000) * 0.002;

    // 4. Save Assistant Response Message
    await AiMessage.create({
      sessionId: session._id,
      role: "assistant",
      content: fullResponseText,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      responseTime,
    });

    // 5. Increment daily usage limits
    const todayStr = new Date().toISOString().split("T")[0];
    await AiUsage.findOneAndUpdate(
      { userId, date: todayStr },
      {
        $inc: {
          tokensUsed: totalTokens,
          cost: cost,
          requestCount: 1,
        },
      },
      { upsert: true, new: true }
    );

    // Sync session details
    session.provider = activeProviderName;
    session.model = streamMeta.usedModel || activeModel;
    session.temperature = activeTemp;
    session.contextLength = activeContext;
    await session.save();

    return session;
  }
}

module.exports = new AiGatewayService();
