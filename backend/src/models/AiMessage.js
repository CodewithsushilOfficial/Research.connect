const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiMessageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AiSession",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        fileType: { type: String, trim: true },
        size: { type: Number },
      },
    ],
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0.0,
    },
    responseTime: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AiMessageSchema.index({ sessionId: 1, createdAt: 1 });

const AiMessage = mongoose.model("AiMessage", AiMessageSchema);

module.exports = AiMessage;
