const mongoose = require('mongoose');

const messageAttachmentSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      index: true
    },
    url: {
      type: String,
      required: true
    },
    // objectKey is the Cloudflare R2 storage key (previously called publicId for Cloudinary).
    // Optional to maintain backwards compatibility and support multiple storage providers.
    objectKey: {
      type: String,
      default: null
    },
    storageProvider: {
      type: String,
      enum: ['r2', 'cloudinary', 'local'],
      default: 'r2'
    },
    filename: {
      type: String
    },
    fileType: {
      type: String
    },
    fileSize: {
      type: Number
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MessageAttachment', messageAttachmentSchema);
