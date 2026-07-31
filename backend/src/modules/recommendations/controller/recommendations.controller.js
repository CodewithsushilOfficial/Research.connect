const recommendationsService = require('../service/recommendations.service');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');

class RecommendationsController {
  getResearchers = asyncHandler(async (req, res) => {
    const {
      limit = 12,
      page = 1,
      cursor,
      search = '',
      researchArea = '',
      institution = '',
      department = '',
      country = '',
      designation = '',
      keyword = '',
      minPublications,
      minCitations,
      minHIndex,
      isAvailableForCollaboration,
      isVerified,
      recentlyJoined,
      sortBy = 'matchPercentage'
    } = req.query;

    const options = {
      limit: Number(limit),
      page: Number(page),
      cursor,
      search: String(search).trim(),
      researchArea: String(researchArea).trim(),
      institution: String(institution).trim(),
      department: String(department).trim(),
      country: String(country).trim(),
      designation: String(designation).trim(),
      keyword: String(keyword).trim(),
      minPublications: minPublications !== undefined && minPublications !== '' ? Number(minPublications) : undefined,
      minCitations: minCitations !== undefined && minCitations !== '' ? Number(minCitations) : undefined,
      minHIndex: minHIndex !== undefined && minHIndex !== '' ? Number(minHIndex) : undefined,
      isAvailableForCollaboration: isAvailableForCollaboration === 'true' || isAvailableForCollaboration === true,
      isVerified: isVerified === 'true' || isVerified === true,
      recentlyJoined: recentlyJoined === 'true' || recentlyJoined === true,
      sortBy
    };

    const result = await recommendationsService.getRecommendedResearchers(req.user._id, options);

    return res.success('Recommended researchers retrieved successfully.', result);
  });

  getPublications = asyncHandler(async (req, res) => {
    const { limit = 10, cursor } = req.query;
    const result = await recommendationsService.getRecommendedPublications(req.user._id, { limit, cursor });
    return res.success('Recommended publications retrieved successfully.', result);
  });



  getProjects = asyncHandler(async (req, res) => {
    const { limit = 10, cursor } = req.query;
    const result = await recommendationsService.getRecommendedProjects(req.user._id, { limit, cursor });
    return res.success('Recommended projects retrieved successfully.', result);
  });

  getFunding = asyncHandler(async (req, res) => {
    const { limit = 10, cursor } = req.query;
    const result = await recommendationsService.getRecommendedFunding(req.user._id, { limit, cursor });
    return res.success('Recommended funding opportunities retrieved successfully.', result);
  });

  getConferences = asyncHandler(async (req, res) => {
    const { limit = 10, cursor } = req.query;
    const result = await recommendationsService.getRecommendedConferences(req.user._id, { limit, cursor });
    return res.success('Recommended conferences retrieved successfully.', result);
  });

  refreshRecommendations = asyncHandler(async (req, res) => {
    // Manually trigger refreshing recommendations
    recommendationsService.refreshAllRecommendations(req.user._id);
    return res.success('Background recommendations calculation started.');
  });
}

module.exports = new RecommendationsController();
