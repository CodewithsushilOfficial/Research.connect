import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Collaboration must belong to a project'],
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collaboration requires a requester'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collaboration requires a receiver'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Message cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique request per user per project
collaborationSchema.index({ project: 1, requester: 1, receiver: 1 }, { unique: true });

const Collaboration = mongoose.model('Collaboration', collaborationSchema);
export default Collaboration;
