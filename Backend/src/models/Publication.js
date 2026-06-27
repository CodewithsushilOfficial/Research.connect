import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Publication must have a title'],
      trim: true,
      unique: true,
    },
    abstract: {
      type: String,
      required: [true, 'Publication must have an abstract'],
      trim: true,
    },
    authors: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        displayName: {
          type: String,
          required: [true, 'Author display name is required'],
        },
        institution: String,
      },
    ],
    journal: {
      type: String,
      trim: true,
    },
    doi: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow multiple null/undefined values
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    citationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
