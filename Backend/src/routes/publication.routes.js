import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createPublication,
  getAllPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
  incrementCitation,
  searchPublications,
  getPublicationVersions,
  restorePublicationVersion,
  uploadPublicationFile,
  logAnalyticsEvent,
  lookupDoi,
} from '../controllers/publication.controller.js';
import {
  createPublicationValidator,
  updatePublicationValidator,
  getPublicationsValidator,
  mongoIdValidator,
} from '../validations/publication.validation.js';
import { protect } from '../middleware/auth.middleware.js';

// Configure Multer Storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx|ppt|zip|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format not supported! Only pdf, docx, ppt, zip, or images are allowed.'));
  },
});

const router = Router();

// Lookup DOI metadata using public API
router.get('/metadata/doi', lookupDoi);

// Search must come before /:id to avoid conflict
router.get('/search', searchPublications);

router
  .route('/')
  .get(getPublicationsValidator, getAllPublications)
  .post(protect, createPublicationValidator, createPublication);

router
  .route('/:id')
  .get(mongoIdValidator, getPublicationById)
  .put(protect, updatePublicationValidator, updatePublication)
  .delete(protect, mongoIdValidator, deletePublication);

// Increment citation count
router.patch('/:id/citation', mongoIdValidator, incrementCitation);

// Version history & restore
router.get('/:id/versions', protect, getPublicationVersions);
router.post('/:id/versions/:versionNum/restore', protect, restorePublicationVersion);

// Files uploads
router.post('/:id/files', protect, upload.single('file'), uploadPublicationFile);

// Analytics logging
router.post('/:id/analytics/log', logAnalyticsEvent);

export default router;
