const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Session",
    },
    workspace: {
      type: String,
      required: true,
      trim: true,
      index: true, // e.g. "paper-summary"
    },
    provider: {
      type: String,
      default: "NVIDIA NIM",
      trim: true,
      index: true,
    },
    model: {
      type: String,
      default: "meta/llama-3.1-70b-instruct",
      trim: true,
      index: true,
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    contextLength: {
      type: Number,
      default: 4096,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for history sorting and fast searches
AiSessionSchema.index({ userId: 1, isDeleted: 1 });
AiSessionSchema.index({ isPinned: -1, updatedAt: -1 });

const AiSession = mongoose.model("AiSession", AiSessionSchema);

module.exports = AiSession;
