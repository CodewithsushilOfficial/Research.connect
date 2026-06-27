import mongoose from 'mongoose';

const savedResearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bookmark must belong to a user'],
      index: true,
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Bookmark must refer to a publication'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique save per publication per user
savedResearchSchema.index({ user: 1, publication: 1 }, { unique: true });

const SavedResearch = mongoose.model('SavedResearch', savedResearchSchema);
export default SavedResearch;
