const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AiVectorStoreSchema = new Schema(
  {
    filePath: {
      type: String,
      required: true,
      index: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AiVectorStore = mongoose.model("AiVectorStore", AiVectorStoreSchema);

module.exports = AiVectorStore;
