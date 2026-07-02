const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');

// All dashboard endpoints require an authenticated user
router.use(authMiddleware);

router.get('/overview', dashboardController.getOverview);
router.get('/recommended-researchers', dashboardController.getRecommendedResearchers);
router.get('/trending-publications', dashboardController.getTrendingPublications);

module.exports = router;
