const chatService = require("../service/chat.service");
const AiSession = require("../../../models/AiSession");
const AiMessage = require("../../../models/AiMessage");
const AiPromptTemplate = require("../../../models/AiPromptTemplate");
const AiUsage = require("../../../models/AiUsage");
const asyncHandler = require("../../../common/middlewares/asyncHandler.middleware");
const { ValidationError, NotFoundError } = require("../../../common/errors/AppError");

class AiController {
  /**
   * Get all prompt templates stored in MongoDB
   */
  getTemplates = asyncHandler(async (req, res) => {
    const { workspace } = req.query;
    const filter = { isActive: true };
    if (workspace) {
      filter.workspace = workspace;
    }
    const templates = await AiPromptTemplate.find(filter).sort({ category: 1, label: 1 });
    return res.success("Prompt templates retrieved successfully.", templates);
  });

  /**
   * Get daily token usage history for the current user
   */
  getHistory = asyncHandler(async (req, res) => {
    const usage = await AiUsage.find({ userId: req.user._id }).sort({ date: -1 });
    return res.success("AI Usage history retrieved.", usage);
  });

  /**
   * Get all active sessions for the user
   */
  getUserSessions = asyncHandler(async (req, res) => {
    const { workspace } = req.query;
    const filter = { userId: req.user._id, isDeleted: { $ne: true } };
    if (workspace) {
      filter.workspace = workspace;
    }
    const sessions = await AiSession.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    return res.success("AI Sessions retrieved successfully.", sessions);
  });

  /**
   * Get single session metadata and message logs
   */
  getSessionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await AiSession.findOne({ _id: id, userId: req.user._id, isDeleted: { $ne: true } });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }
    // Fetch associated messages
    const messages = await AiMessage.find({ sessionId: id }).sort({ createdAt: 1 });
    return res.success("AI Session details retrieved.", {
      session,
      messages,
    });
  });

  /**
   * Create an empty AI session
   */
  createSession = asyncHandler(async (req, res) => {
    const { workspace, title } = req.body;
    if (!workspace) {
      throw new ValidationError("Workspace type is required.");
    }
    const session = await AiSession.create({
      userId: req.user._id,
      workspace,
      title: title || "New Session",
    });
    return res.success("AI Session created successfully.", session, 201);
  });

  /**
   * Rename or Pin session
   */
  updateSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await AiSession.findOne({ _id: id, userId: req.user._id, isDeleted: { $ne: true } });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }

    const whitelistedKeys = ["title", "isPinned", "provider", "model", "temperature", "contextLength"];
    whitelistedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        session[key] = req.body[key];
      }
    });

    await session.save();
    return res.success("AI Session updated successfully.", session);
  });

  /**
   * Soft delete session history
   */
  deleteSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await AiSession.findOne({ _id: id, userId: req.user._id, isDeleted: { $ne: true } });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }

    session.isDeleted = true;
    session.deletedAt = new Date();
    session.deletedBy = req.user._id;
    await session.save();

    return res.success("AI Session deleted successfully.", null);
  });

  /**
   * Generates a Server-Sent Event (SSE) streaming response
   */
  generateResponse = asyncHandler(async (req, res) => {
    const {
      workspace,
      prompt,
      sessionId,
      provider,
      model,
      temperature,
      contextLength,
      attachments,
    } = req.body;

    if (!workspace) {
      throw new ValidationError("Workspace is required.");
    }
    if (!prompt) {
      throw new ValidationError("Prompt text is required.");
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevents Nginx/proxy buffering
    res.flushHeaders();

    try {
      const session = await chatService.streamResponse({
        userId: req.user._id,
        workspace,
        prompt,
        sessionId,
        provider,
        model,
        temperature,
        contextLength,
        attachments,
        onChunk: (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          if (typeof res.flush === "function") {
            res.flush(); // Flush compression buffer
          }
        },
      });

      // Send termination packet with completed session details
      res.write(`data: ${JSON.stringify({ done: true, session })}\n\n`);
      if (typeof res.flush === "function") {
        res.flush();
      }
      res.end();
    } catch (error) {
      console.error("Controller streaming error:", error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      if (typeof res.flush === "function") {
        res.flush();
      }
      res.end();
    }
  });
}

module.exports = new AiController();
