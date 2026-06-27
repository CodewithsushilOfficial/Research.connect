import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Research title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Research must belong to a creator'],
    },
    status: {
      type: String,
      enum: ['draft', 'under-review', 'published'],
      default: 'draft',
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
  },
  {
    timestamps: true,
  }
);

const Research = mongoose.model('Research', researchSchema);
export default Research;
