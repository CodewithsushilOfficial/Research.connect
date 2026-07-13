const { body, param, query, validationResult } = require('express-validator');

// ─── Utility ─────────────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      error: errors.array(),
    });
  }
  next();
};

// ─── Project Validators ───────────────────────────────────────────────────────
const createProjectRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 500 }),
  body('status').optional().isIn(['draft', 'recruiting', 'active', 'completed', 'archived', 'cancelled']),
  body('visibility').optional().isIn(['public', 'private', 'hidden', 'institution-only', 'invitation-only']),
  body('projectType').optional().isIn(['open-source', 'private', 'institution-only', 'invitation-only']),
  body('maxTeamMembers').optional().isInt({ min: 1, max: 1000 }),
  body('applicationDeadline').optional().isISO8601(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('budget').optional().isNumeric({ min: 0 }),
  body('objectives').optional().isArray(),
  body('requiredSkills').optional().isArray(),
  body('tags').optional().isArray(),
  body('keywords').optional().isArray(),
  body('researchAreas').optional().isArray(),
  body('screeningQuestions').optional().isArray(),
];

const updateProjectRules = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('abstract').optional().trim().isLength({ max: 1000 }),
  body('longDescription').optional().isLength({ max: 20000 }),
  body('maxTeamMembers').optional().isInt({ min: 1, max: 1000 }),
  body('applicationDeadline').optional().isISO8601(),
  body('visibility').optional().isIn(['public', 'private', 'hidden', 'institution-only', 'invitation-only']),
  body('allowApplications').optional().isBoolean(),
  body('allowInvitations').optional().isBoolean(),
  body('progress').optional().isFloat({ min: 0, max: 100 }),
];

const listProjectsRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['draft', 'recruiting', 'active', 'completed', 'archived', 'cancelled']),
  query('visibility').optional().isIn(['public', 'private', 'hidden', 'institution-only', 'invitation-only']),
];

const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`Invalid ${name}.`),
];

module.exports = {
  validate,
  createProjectRules,
  updateProjectRules,
  listProjectsRules,
  mongoIdParam,
};
