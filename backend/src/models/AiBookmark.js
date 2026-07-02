const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiBookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AiSession",
    },
    workspace: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Saved Output",
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AiBookmark = mongoose.model("AiBookmark", AiBookmarkSchema);

module.exports = AiBookmark;
