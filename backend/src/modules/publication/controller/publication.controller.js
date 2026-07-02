const publicationService = require('../service/publication.service');
const cloudinaryService = require('../service/cloudinary.service');
const publicationDTO = require('../dto/publication.dto');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');
const { ValidationError } = require('../../../common/errors/AppError');

// Helper to extract IP, User and User-Agent
const getClientInfo = (req) => {
  return {
    userId: req.user ? req.user._id : null,
    user: req.user || null,
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
  };
};

class PublicationController {
  // Publish Research
  createPublication = asyncHandler(async (req, res) => {
    const pub = await publicationService.createPublication(req.user._id, req.body, false);
    return res.success(
      'Research published successfully.',
      publicationDTO.formatPublication(pub),
      201
    );
  });

  // Save Draft
  saveDraft = asyncHandler(async (req, res) => {
    const pub = await publicationService.createPublication(req.user._id, req.body, true);
    return res.success(
      'Draft saved successfully.',
      publicationDTO.formatPublication(pub),
      201
    );
  });

  // Upload File to Cloudinary
  uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError('No file was uploaded.');
    }

    const result = await cloudinaryService.uploadFileBuffer(req.file.buffer, req.file.originalname);
    
    return res.success('File uploaded to Cloudinary successfully.', {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
      format: result.format
    });
  });

  // List Publications (supports filters: userId, status, visibility, etc.)
  getPublications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-createdAt', userId, status, visibility } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (visibility) filter.visibility = visibility;

    const result = await publicationService.getPublications(filter, { page, limit, sort });
    
    return res.success('Publications retrieved successfully.', {
      docs: publicationDTO.formatPublicationList(result.docs),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  });

  // Get publications by profileSlug
  getPublicationsByProfileSlug = asyncHandler(async (req, res) => {
    const { profileSlug } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const result = await publicationService.getPublicationsByProfileSlug(profileSlug, { page, limit, sort });

    return res.success('Publications retrieved successfully.', {
      docs: publicationDTO.formatPublicationList(result.docs),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  });

  // Get My Publications (with trash, draft, etc.)
  getMyPublications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = '-createdAt', status, visibility, trash } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (visibility) filter.visibility = visibility;
    
    if (trash === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }

    const result = await publicationService.getPublications(filter, { page, limit, sort });

    return res.success('My publications retrieved successfully.', {
      docs: publicationDTO.formatPublicationList(result.docs),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  });

  // Extract Metadata from PDF Upload
  extractMetadata = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError('No file was uploaded.');
    }

    const metadataService = require('../service/metadataExtraction.service');
    const result = await metadataService.extractMetadata(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.success('Metadata extracted successfully.', result);
  });

  // Get single publication by slug
  getPublicationBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const clientInfo = getClientInfo(req);
    
    const pub = await publicationService.getPublicationBySlug(slug, clientInfo);
    
    return res.success(
      'Publication details retrieved successfully.',
      publicationDTO.formatPublication(pub)
    );
  });

  // Get publication for reader and track analytics progress
  getPublicationForReader = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const clientInfo = getClientInfo(req);

    const pub = await publicationService.getPublicationBySlug(slug, clientInfo);

    // Track reader event in background
    try {
      const PublicationReader = require('../../../models/PublicationReader');
      if (PublicationReader && req.user) {
        await PublicationReader.findOneAndUpdate(
          { publicationId: pub.id || pub._id, userId: req.user._id },
          { lastReadAt: new Date() },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      // Ignore background tracking errors
    }

    return res.success(
      'Publication details retrieved for reader successfully.',
      publicationDTO.formatPublication(pub)
    );
  });

  // Update publication
  updatePublication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pub = await publicationService.updatePublication(id, req.user._id, req.body);
    
    return res.success(
      'Publication updated successfully.',
      publicationDTO.formatPublication(pub)
    );
  });

  // Delete publication
  deletePublication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await publicationService.deletePublication(id, req.user._id);
    
    return res.success('Publication deleted successfully.');
  });

  // Restore soft deleted publication
  restorePublication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pub = await publicationService.restorePublication(id, req.user._id);

    return res.success(
      'Publication restored successfully.',
      publicationDTO.formatPublication(pub)
    );
  });

  // Track download of file
  trackDownload = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const clientInfo = getClientInfo(req);
    
    const result = await publicationService.trackDownload(id, clientInfo);
    
    return res.success('Download tracked successfully.', result);
  });
}

module.exports = new PublicationController();
