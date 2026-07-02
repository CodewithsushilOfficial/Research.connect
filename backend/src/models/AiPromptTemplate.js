const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiPromptTemplateSchema = new Schema(
  {
    workspace: {
      type: String,
      required: true,
      trim: true,
      index: true, // e.g. "literature-review"
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const AiPromptTemplate = mongoose.model("AiPromptTemplate", AiPromptTemplateSchema);

module.exports = AiPromptTemplate;
