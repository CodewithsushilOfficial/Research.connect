import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project must have a title'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Project must have a description'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must have an owner'],
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'collaborator', 'viewer'],
          default: 'collaborator',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['proposed', 'active', 'completed', 'archived'],
      default: 'proposed',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
