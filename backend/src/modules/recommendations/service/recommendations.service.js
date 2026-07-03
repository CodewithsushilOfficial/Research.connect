const recommendationsRepository = require('../repository/recommendations.repository');
const config = require('../../../config/recommendation.config');
const Profile = require('../../../models/Profile');
const User = require('../../../models/User');
const Publication = require('../../../models/Publication');
const Follow = require('../../../models/Follow');
const Connection = require('../../../models/Connection');

const Project = require('../../../models/Project');
const Event = require('../../../models/Event');
const logger = require('../../../common/logger/winston');

class RecommendationsService {
  /**
   * Refreshes the cached recommendation profile of a user.
   */
  async refreshUserRecommendationProfile(userId) {
    const [profile, followingDocs, connections, userPublications] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Follow.find({ followerId: userId }).select('followingId').lean(),
      Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted'
      }).lean(),
      Publication.find({ userId, isDeleted: { $ne: true } }).select('keywords researchAreas authors').lean()
    ]);

    const followingIds = followingDocs.map(f => f.followingId.toString());
    const connectionIds = connections.map(c =>
      c.senderId.toString() === userId.toString() ? c.receiverId.toString() : c.senderId.toString()
    );

    const researchAreas = profile?.researchAreas || [];
    const keywords = profile?.skills?.map(s => s.name) || [];
    const institutions = profile?.institution ? [profile.institution] : [];
    const countries = profile?.country ? [profile.country] : [];

    // Aggregate co-authors from publications
    const coAuthorSet = new Set();
    userPublications.forEach(pub => {
      if (pub.authors) {
        pub.authors.split(',').forEach(auth => {
          const trimmed = auth.trim();
          if (trimmed) coAuthorSet.add(trimmed);
        });
      }
    });

    const recommendationProfile = {
      researchAreas,
      keywords,
      institutions,
      coAuthors: Array.from(coAuthorSet),
      communities: [], // Can be updated based on joined communities if needed
      projects: [],
      datasets: [],
      countries,
      languages: [],
      activityCount: userPublications.length * 5 + followingIds.length + connectionIds.length
    };

    await recommendationsRepository.saveProfile(userId, recommendationProfile);
    return recommendationProfile;
  }

  /**
   * Calculates the compatibility score (0-100%) between two users.
   */
  async calculateCompatibilityScore(userId, targetUserId) {
    // Fetch profiles for both users
    const [userProfile, targetProfile] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Profile.findOne({ userId: targetUserId }).lean()
    ]);

    if (!userProfile || !targetProfile) {
      return { score: 0, reasons: ['Missing profile data'] };
    }

    // Fetch connection and follow contexts
    const [userFollows, userConnections, targetPublications] = await Promise.all([
      Follow.find({ followerId: userId }).lean(),
      Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted'
      }).lean(),
      Publication.find({ userId: targetUserId, isDeleted: { $ne: true } }).lean()
    ]);

    const userFollowsIds = userFollows.map(f => f.followingId.toString());
    const userConnectionIds = userConnections.map(c =>
      c.senderId.toString() === userId.toString() ? c.receiverId.toString() : c.senderId.toString()
    );

    const w = config.weights;
    let score = 0;
    const reasons = [];

    // 1. Research Areas (30%)
    const userAreas = (userProfile.researchAreas || []).map(a => (typeof a === 'string' ? a : a.name || '').toLowerCase().trim());
    const targetAreas = (targetProfile.researchAreas || []).map(a => (typeof a === 'string' ? a : a.name || '').toLowerCase().trim());
    const sharedAreas = userAreas.filter(a => targetAreas.includes(a));
    if (sharedAreas.length > 0) {
      const areaMatch = Math.min(1.0, sharedAreas.length / Math.max(1, userAreas.length));
      score += w.researchAreas * areaMatch * 100;
      reasons.push('Same Research Areas');
    }

    // 2. Keywords (25%)
    const userKeywords = (userProfile.skills || []).map(s => s.name.toLowerCase().trim());
    const targetKeywords = (targetProfile.skills || []).map(s => s.name.toLowerCase().trim());
    const sharedKeywords = userKeywords.filter(k => targetKeywords.includes(k));
    if (sharedKeywords.length > 0) {
      const keywordMatch = Math.min(1.0, sharedKeywords.length / 5); // Max weight if 5 or more matching keywords
      score += w.keywords * keywordMatch * 100;
      reasons.push('Same Keywords');
    }

    // 3. Publications (15%)
    if (targetPublications.length > 0) {
      // Check if user interests match target's publication keywords/areas
      const targetPubKeywords = [];
      targetPublications.forEach(p => (p.keywords || []).forEach(k => targetPubKeywords.push(k.toLowerCase().trim())));
      const sharedPubKeywords = userKeywords.filter(k => targetPubKeywords.includes(k));
      if (sharedPubKeywords.length > 0) {
        const pubMatch = Math.min(1.0, sharedPubKeywords.length / 5);
        score += w.publications * pubMatch * 100;
        reasons.push('Overlap in Publication Topics');
      }
    }

    // 4. Institution (10%)
    if (userProfile.institution && targetProfile.institution && 
        userProfile.institution.toLowerCase().trim() === targetProfile.institution.toLowerCase().trim()) {
      score += w.institution * 100;
      reasons.push('Same Institution');
    } else if (userProfile.country && targetProfile.country && 
               userProfile.country.toLowerCase().trim() === targetProfile.country.toLowerCase().trim()) {
      score += w.institution * 0.3 * 100; // partial points for same country
      reasons.push('Same Country');
    }

    // 5. Connections (5%)
    // Find mutual connections
    const targetConnections = await Connection.find({
      $or: [{ senderId: targetUserId }, { receiverId: targetUserId }],
      status: 'accepted'
    }).lean();
    const targetConnectionIds = targetConnections.map(c =>
      c.senderId.toString() === targetUserId.toString() ? c.receiverId.toString() : c.senderId.toString()
    );
    const mutualConnections = userConnectionIds.filter(id => targetConnectionIds.includes(id));
    if (mutualConnections.length > 0) {
      const connMatch = Math.min(1.0, mutualConnections.length / 3);
      score += w.connections * connMatch * 100;
      reasons.push(`${mutualConnections.length} Mutual Connection${mutualConnections.length > 1 ? 's' : ''}`);
    }



    // 7. Co-authors (5%)
    // Check if they co-authored publications
    let isCoAuthor = false;
    const authorNameLower = `${userProfile.userId?.firstName} ${userProfile.userId?.lastName}`.toLowerCase().trim();
    targetPublications.forEach(pub => {
      if (pub.authors && pub.authors.toLowerCase().includes(authorNameLower)) {
        isCoAuthor = true;
      }
    });
    if (isCoAuthor) {
      score += w.coAuthors * 100;
      reasons.push('Co-authored Publications');
    }

    // 8. Activity (5%)
    const activityFactor = targetProfile.profileCompletion ? targetProfile.profileCompletion / 100 : 0.5;
    score += w.activity * activityFactor * 100;

    return {
      score: Math.min(100, Math.max(0, Math.round(score))),
      reasons
    };
  }

  /**
   * Refreshes recommendation scores for a single user in the background.
   */
  async refreshAllRecommendations(userId) {
    try {
      logger.info(`Starting background recommendations refresh for user: ${userId}`);
      
      // Refresh user profile cache first
      await this.refreshUserRecommendationProfile(userId);

      // 1. Refresh Researcher Matches
      const otherUsers = await User.find({ 
        _id: { $ne: userId }, 
        status: 'active', 
        isDeleted: { $ne: true } 
      }).select('_id').lean();

      for (const targetUser of otherUsers) {
        const { score, reasons } = await this.calculateCompatibilityScore(userId, targetUser._id);
        if (score >= 10) { // Only store meaningful matches
          await recommendationsRepository.saveRecommendationScore(
            userId, 
            targetUser._id, 
            'User', 
            score, 
            reasons
          );
        }
      }

      // 2. Refresh Publication Matches
      // Simple publication matcher based on keywords
      const userProfile = await Profile.findOne({ userId }).lean();
      const userKeywords = (userProfile?.skills || []).map(s => s.name.toLowerCase().trim());
      const publications = await Publication.find({ 
        userId: { $ne: userId }, 
        isDeleted: { $ne: true } 
      }).select('_id keywords title').lean();

      for (const pub of publications) {
        const pubKeywords = (pub.keywords || []).map(k => k.toLowerCase().trim());
        const shared = userKeywords.filter(k => pubKeywords.includes(k));
        let pubScore = 0;
        const reasons = [];

        if (shared.length > 0) {
          pubScore = Math.min(100, Math.round((shared.length / Math.max(5, userKeywords.length)) * 100));
          reasons.push('Same Keywords');
        }

        if (pubScore >= 10) {
          await recommendationsRepository.saveRecommendationScore(
            userId, 
            pub._id, 
            'Publication', 
            pubScore, 
            reasons
          );
        }
      }



      logger.info(`Completed recommendations refresh for user: ${userId}`);
    } catch (err) {
      logger.error(`Error refreshing recommendations for user ${userId}:`, err);
    }
  }

  /**
   * Retrieves recommended researchers for a user.
   */
  async getRecommendedResearchers(userId, queryOptions = {}) {
    const dismissedIds = await recommendationsRepository.getInteractedTargetIds(userId, 'User', ['dismiss']);
    const followingDocs = await Follow.find({ followerId: userId }).select('followingId').lean();
    const followingIds = followingDocs.map(f => f.followingId.toString());

    // Retrieve scores
    const result = await recommendationsRepository.getRecommendationScores(userId, 'User', queryOptions);
    
    // Filter out followed and dismissed researchers, then populate
    const filteredDocs = [];
    for (const scoreDoc of result.docs) {
      const targetIdStr = scoreDoc.targetId.toString();
      if (followingIds.includes(targetIdStr) || dismissedIds.includes(targetIdStr)) {
        continue;
      }

      const user = await User.findById(scoreDoc.targetId).select('firstName lastName fullName profileImage').lean();
      const profile = await Profile.findOne({ userId: scoreDoc.targetId }).select('institution department designation skills').lean();

      if (user) {
        filteredDocs.push({
          userId: user._id,
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          avatar: user.profileImage || (profile ? profile.profileImage : ''),
          institution: profile?.institution || '',
          department: profile?.department || '',
          designation: profile?.designation || '',
          matchPercentage: scoreDoc.score,
          reasons: scoreDoc.reasons,
          skills: profile?.skills || []
        });
      }
    }

    return {
      docs: filteredDocs,
      nextCursor: result.nextCursor
    };
  }

  /**
   * Retrieves recommended publications.
   */
  async getRecommendedPublications(userId, queryOptions = {}) {
    const dismissedIds = await recommendationsRepository.getInteractedTargetIds(userId, 'Publication', ['dismiss']);
    const result = await recommendationsRepository.getRecommendationScores(userId, 'Publication', queryOptions);

    const filteredDocs = [];
    for (const scoreDoc of result.docs) {
      if (dismissedIds.includes(scoreDoc.targetId.toString())) continue;

      const pub = await Publication.findById(scoreDoc.targetId)
        .populate('userId', 'firstName lastName fullName profileImage institution')
        .lean();

      if (pub) {
        filteredDocs.push({
          ...pub,
          matchPercentage: scoreDoc.score,
          reasons: scoreDoc.reasons
        });
      }
    }

    return {
      docs: filteredDocs,
      nextCursor: result.nextCursor
    };
  }



  /**
   * Retrieves recommended projects.
   */
  async getRecommendedProjects(userId, queryOptions = {}) {
    // Fallback: Query projects matching user's keywords or areas
    const profile = await Profile.findOne({ userId }).lean();
    const keywords = (profile?.skills || []).map(s => s.name.toLowerCase());

    const projects = await Project.find({
      userId: { $ne: userId },
      isDeleted: { $ne: true }
    })
      .populate('userId', 'firstName lastName fullName profileImage')
      .limit(10)
      .lean();

    const scored = projects.map(p => {
      const pKeywords = (p.keywords || []).map(k => k.toLowerCase());
      const shared = keywords.filter(k => pKeywords.includes(k));
      const score = shared.length > 0 ? Math.min(100, Math.round((shared.length / Math.max(3, keywords.length)) * 100)) : 15;
      return {
        ...p,
        matchPercentage: score,
        reasons: shared.length > 0 ? ['Shared Keywords'] : ['Suggested Collaboration']
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      docs: scored,
      nextCursor: null
    };
  }

  /**
   * Retrieves recommended funding opportunities.
   */
  async getRecommendedFunding(userId, queryOptions = {}) {
    // Fetch upcoming events of type 'Funding'
    const fundingEvents = await Event.find({
      type: 'Funding',
      date: { $gte: new Date() },
      isDeleted: { $ne: true }
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();

    return {
      docs: fundingEvents,
      nextCursor: null
    };
  }

  /**
   * Retrieves recommended conferences.
   */
  async getRecommendedConferences(userId, queryOptions = {}) {
    // Fetch upcoming events of type 'Conference'
    const conferences = await Event.find({
      type: 'Conference',
      date: { $gte: new Date() },
      isDeleted: { $ne: true }
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();

    return {
      docs: conferences,
      nextCursor: null
    };
  }
}

module.exports = new RecommendationsService();
