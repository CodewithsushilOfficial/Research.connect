import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belong to a user'],
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Researcher', // e.g. PhD Candidate, Postdoctoral Fellow, Professor
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    institution: {
      type: String,
      required: [true, 'Please provide institution or organization name'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    avatarUrl: {
      type: String,
      default: '',
    },
    socialLinks: {
      orcid: { type: String, default: '' },
      linkedIn: { type: String, default: '' },
      gitHub: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
profileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
