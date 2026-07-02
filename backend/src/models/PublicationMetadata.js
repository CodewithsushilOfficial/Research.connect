const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicationMetadataSchema = new Schema(
  {
    publicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Publication',
      required: true,
      index: true,
      unique: true
    },
    abstract: {
      type: String,
      default: ''
    },
    references: [
      {
        type: String,
        trim: true
      }
    ],
    publisher: {
      type: String,
      default: ''
    },
    customFields: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

const PublicationMetadata = mongoose.model('PublicationMetadata', PublicationMetadataSchema);

module.exports = PublicationMetadata;
