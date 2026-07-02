const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiUsageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
      index: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0.0,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch daily usage for a user
AiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const AiUsage = mongoose.model("AiUsage", AiUsageSchema);

module.exports = AiUsage;
