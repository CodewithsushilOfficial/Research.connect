const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');

class DashboardController {
  getOverview = asyncHandler(async (req, res) => {
    return res.success('Dashboard overview retrieved successfully.', {
      metrics: {
        publications: 12,
        citations: 384,
        hIndex: 15,
        i10Index: 8
      }
    });
  });

  getRecommendedResearchers = asyncHandler(async (req, res) => {
    return res.success('Recommended researchers listed successfully.', {
      researchers: [
        { id: 'r1', name: 'Dr. Asha Kulkarni', title: 'Assistant Professor', institution: 'IIT Bombay' },
        { id: 'r2', name: 'Prof. Ravi Menon', title: 'Associate Professor', institution: 'IISc Bangalore' },
        { id: 'r3', name: 'Dr. Sara Gomez', title: 'Research Scientist', institution: 'CERN' }
      ]
    });
  });

  getTrendingPublications = asyncHandler(async (req, res) => {
    return res.success('Trending publications loaded successfully.', {
      publications: [
        { id: 'p1', title: 'Attention Is All You Need', citations: 120531 },
        { id: 'p2', title: 'Deep Residual Learning for Image Recognition', citations: 98241 }
      ]
    });
  });
}

module.exports = new DashboardController();
