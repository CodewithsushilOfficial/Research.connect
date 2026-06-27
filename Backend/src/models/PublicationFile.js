import mongoose from 'mongoose';

const publicationFileSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'File must belong to a publication'],
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'ppt', 'zip', 'dataset', 'image'],
      required: [true, 'File type is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user is required'],
    },
  },
  {
    timestamps: true,
  }
);

const PublicationFile = mongoose.model('PublicationFile', publicationFileSchema);
export default PublicationFile;
